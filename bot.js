require("dotenv").config();
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");
const tmi = require("tmi.js");
const axios = require("axios");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// ========================
// SERVIDOR WEB PARA OBS
// ========================

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false // En producción poner true + trust proxy
    }
}));

const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => console.error("❌ Error conectando a MongoDB:", err));

app.use(express.static("public"));

// ========================
// AUTH TWITCH
// ========================

app.get("/auth/twitch", (req, res) => {

    const redirect = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&response_type=code&scope=chat:read+chat:edit+user:read:email+channel:read:subscriptions`;

    res.redirect(redirect);
});

app.get("/auth/twitch/callback", async (req, res) => {

    const code = req.query.code;

    try {

        const tokenRes = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: process.env.TWITCH_REDIRECT_URI
            }
        });

        const accessToken = tokenRes.data.access_token;
        const refreshToken = tokenRes.data.refresh_token;


        // Obtener info del usuario
        const userRes = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${accessToken}`
            }
        });

        const user = userRes.data.data[0];

        // Guardar en DB
        await User.findOneAndUpdate(
            { twitchId: user.id },
            {
                twitchId: user.id,
                login: user.login,
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            { upsert: true, new: true }
        );


        // Hacer que el bot se una a su canal
        await client.join(user.login);

        // Guardar sesión
        req.session.user = {
            id: user.id,
            login: user.login
        };

        res.redirect("/dashboard");

    } catch (err) {
        console.log(err.response?.data || err.message);
        res.send("❌ Error en autenticación");
    }
});

// ========================
// MIDDLEWARE AUTH
// ========================

function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/");
    }
    next();
}

// ========================
// RUTAS
// ========================

app.get("/", (req, res) => {
    res.send(`<h1>Blotver</h1><a href="/auth/twitch">Login con Twitch</a>`);
});

app.get("/dashboard", isAuthenticated, async (req, res) => {

    const userDB = await User.findOne({ twitchId: req.session.user.id });

    const estadoBot = userDB.botActive ? "🟢 Conectado" : "🔴 Desconectado";
    const botonTexto = userDB.botActive ? "Desconectar Bot" : "Conectar Bot";

    res.send(`
        <h1>Panel de ${req.session.user.login}</h1>
        <p>Estado del bot: ${estadoBot}</p>
        <a href="/bot/toggle">${botonTexto}</a>
        <br><br>
        <a href="/logout">Cerrar sesión</a>
    `);
});


app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/bot/toggle", isAuthenticated, async (req, res) => {

    const userDB = await User.findOne({ twitchId: req.session.user.id });

    if (!userDB) return res.redirect("/dashboard");

    if (userDB.botActive) {
        // Desactivar bot
        await client.part(userDB.login);
        userDB.botActive = false;
        await userDB.save();
        console.log(`⛔ Bot desconectado de ${userDB.login}`);
    } else {
        // Activar bot
        await client.join(userDB.login);
        userDB.botActive = true;
        await userDB.save();
        console.log(`✅ Bot reconectado a ${userDB.login}`);
    }

    res.redirect("/dashboard");
});


server.listen(3000, () => {
    console.log("🌐 Overlay iniciado en: http://localhost:3000");
});

// ========================
// CONFIGURACIÓN DEL BOT
// ========================

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.BOT_USERNAME,
        password: process.env.OAUTH_CHAT
    },
    channels: []
});




client.connect();

client.on("connected", async () => {
    console.log("🔄 Buscando usuarios guardados...");

    const users = await User.find({ botActive: true });

    for (const user of users) {
        console.log(`👉 Uniéndose a ${user.login}`);
        await client.join(user.login);
    }

    console.log("✅ Reconexión automática completa.");
});

console.log("🤖 Bot iniciado correctamente!");

// ========================
// FUNCIONES TWITCH API
// ========================

async function twitchAPI(url, userDB) {

    try {

        return await axios.get(url, {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${userDB.accessToken}`
            }
        });

    } catch (error) {

        // Si el token venció
        if (error.response && error.response.status === 401) {

            console.log(`⚠️ Token vencido para ${userDB.login}, refrescando...`);

            const newAccessToken = await refreshAccessToken(userDB);

            if (!newAccessToken) return null;

            // Reintentar con nuevo token
            return await axios.get(url, {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID,
                    "Authorization": `Bearer ${newAccessToken}`
                }
            });
        }

        throw error;
    }
}


async function refreshAccessToken(userDB) {
    try {

        const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
            params: {
                grant_type: "refresh_token",
                refresh_token: userDB.refreshToken,
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET
            }
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        userDB.accessToken = newAccessToken;
        userDB.refreshToken = newRefreshToken;

        await userDB.save();

        console.log(`🔄 Token refrescado para ${userDB.login}`);

        return newAccessToken;

    } catch (error) {
        console.log("❌ Error refrescando token:");
        console.log(error.response?.data || error.message);
        return null;
    }
}


async function getUserId(username, userDB) {
    const res = await twitchAPI(
        `https://api.twitch.tv/helix/users?login=${username}`,
        userDB
    );

    if (!res || res.data.data.length === 0) return null;

    return res.data.data[0].id;
}

async function getRandomClip(userId, userDB) {
    const res = await twitchAPI(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}`,
        userDB
    );

    if (!res) return null;

    const clips = res.data.data;

    if (!clips || clips.length === 0) return null;

    return clips[Math.floor(Math.random() * clips.length)];
}


async function getRandomClip(userId, accessToken) {
    const res = await twitchAPI(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}`,
        accessToken
    );

    const clips = res.data.data;

    if (!clips || clips.length === 0) return null;

    return clips[Math.floor(Math.random() * clips.length)];
}

// ========================
// COMANDOS
// ========================

client.on("message", async (channel, tags, message, self) => {
    if (self) return;

    const args = message.trim().split(" ");
    const command = args[0].toLowerCase();

    if (command === "!so") {

        const esMod = tags.mod || tags.badges?.broadcaster;

        if (!esMod) {
            client.say(channel, "⛔ Solo los moderadores pueden usar este comando.");
            return;
        }

        if (!args[1]) {
            client.say(channel, "❌ Debes escribir un usuario. Ejemplo: !so nombre");
            return;
        }

        const usuario = args[1].replace("@", "").toLowerCase();

        try {

            // 🔥 Buscar dueño del canal actual
            const channelName = channel.replace("#", "");
            const userDB = await User.findOne({ login: channelName });

            if (!userDB) {
                console.log("⚠️ Usuario no encontrado en DB.");
                return;
            }

            const userId = await getUserId(usuario, userDB);

            if (!userId) {
                client.say(channel, "❌ Usuario no encontrado.");
                return;
            }

            const clip = await getRandomClip(userId, userDB);


            if (!clip) {
                client.say(channel, "⚠️ Ese canal no tiene clips.");
                return;
            }

            // Enviar al chat
            client.say(channel, `🎬 Clip de ${usuario}: ${clip.url}`);

            // Enviar al overlay OBS
            io.emit("newClip", clip.embed_url);

        } catch (error) {
            console.log("❌ Error obteniendo clip:");
            console.log(error.response?.data || error.message);
        }

    }
});
