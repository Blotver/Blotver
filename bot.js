require("dotenv").config();
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");
const tmi = require("tmi.js");
const axios = require("axios");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// ========================
// SERVIDOR WEB
// ========================

const app = express();

app.use(express.static("public"));

app.use(express.json());

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
// AUTH TWITCH
// ========================

app.get("/auth/twitch", (req, res) => {

    const redirect = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&response_type=code&scope=chat:read+chat:edit+user:read:email+channel:read:subscriptions`;

    res.redirect(redirect);
});

app.get("/auth/twitch/callback", async (req, res) => {

    console.log("QUERY:", req.query);

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

        const userRes = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${accessToken}`
            }
        });

        const user = userRes.data.data[0];

        await User.findOneAndUpdate(
            { twitchId: user.id },
            {
                twitchId: user.id,
                login: user.login,
                accessToken,
                refreshToken,
                botActive: true,
                profileImageUrl: user.profile_image_url
            },
            { upsert: true, new: true }
        );


        if (!client.getChannels().includes(`#${user.login}`)) {
            await client.join(user.login);
        }


        req.session.user = {
            id: user.id,
            login: user.login
        };

        res.redirect("/dashboard");

    } catch (err) {
        console.log("===== ERROR AUTH =====");
        console.log("status:", err.response?.status);
        console.log("data:", err.response?.data);
        console.log("message:", err.message);
        console.log("======================");
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

app.get("/overlay", (req, res) => {
    res.sendFile(path.join(__dirname, "public/overlay.html"));
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

        await client.part(userDB.login);
        userDB.botActive = false;

        console.log(`⛔ Bot desconectado de ${userDB.login}`);
    } else {

        await client.join(userDB.login);
        userDB.botActive = true;

        console.log(`✅ Bot reconectado a ${userDB.login}`);
    }

    await userDB.save();
    res.redirect("/dashboard");
});

app.get("/api/user", isAuthenticated, async (req, res) => {

    const userDB = await User.findOne({ twitchId: req.session.user.id });

    if (!userDB) {
        return res.json({ error: "Usuario no encontrado" });
    }

    res.json({
        id: userDB.twitchId,
        login: userDB.login,
        botActive: userDB.botActive,
        createdAt: userDB.createdAt,
        profile_image_url: userDB.profileImageUrl || null
    });

});


app.delete("/api/delete-account", isAuthenticated, async (req, res) => {

    const userDB = await User.findOne({ twitchId: req.session.user.id });

    if (!userDB) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Si el bot está activo lo desconectamos primero
    if (userDB.botActive) {
        await client.part(userDB.login);
        console.log(`⛔ Bot desconectado de ${userDB.login} antes de eliminar cuenta`);
    }

    await User.deleteOne({ twitchId: req.session.user.id });

    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.post("/api/toggle-bot", isAuthenticated, async (req, res) => {

    const userDB = await User.findOne({ twitchId: req.session.user.id });
    if (!userDB) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (userDB.botActive) {
        await client.part(userDB.login);
        userDB.botActive = false;
        console.log(`⛔ Bot desconectado de ${userDB.login}`);
    } else {
        await client.join(userDB.login);
        userDB.botActive = true;
        console.log(`✅ Bot reconectado a ${userDB.login}`);
    }

    await userDB.save();

    res.json({ botActive: userDB.botActive });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/dashboard/profile", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});


server.listen(3000, () => {
    console.log("🌐 Servidor iniciado en: http://localhost:3000");
});

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


        if (error.response && error.response.status === 401) {

            console.log(`⚠️ Token vencido para ${userDB.login}, refrescando...`);

            const newAccessToken = await refreshAccessToken(userDB);

            if (!newAccessToken) return null;

            
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

        userDB.accessToken = response.data.access_token;
        userDB.refreshToken = response.data.refresh_token;
        await userDB.save();

        console.log(`🔄 Token refrescado para ${userDB.login}`);
        return response.data.access_token;

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


            const channelName = channel.replace("#", "");

            const userDB = await User.findOne({ login: channelName });
            if (!userDB) return;

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


            client.say(channel, `🎬 Clip de ${usuario}: ${clip.url}`);


            io.emit("newClip", clip.embed_url);


        } catch (error) {
            console.log(" Error obteniendo clip:");
            console.log(error.response?.data || error.message);
        }

    }
});
