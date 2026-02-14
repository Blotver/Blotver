require("dotenv").config();
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");
const tmi = require('tmi.js');
const axios = require('axios');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

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
        secure: false // en Render después lo pondremos true
    }
}));

const server = http.createServer(app);
const io = new Server(server);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => console.error("❌ Error conectando a MongoDB:", err));

app.use(express.static('public'));
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

        // Obtener info del usuario
        const userRes = await axios.get("https://api.twitch.tv/helix/users", {
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${accessToken}`
            }
        });

        const user = userRes.data.data[0];

        // Guardar en sesión
        await User.findOneAndUpdate(
            { twitchId: user.id },
            {
                twitchId: user.id,
                login: user.login,
                accessToken: accessToken
            },
            { upsert: true, new: true }
        );
        // Hacer que el bot se una a su canal
        await client.join(user.login);
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
    channels: [] // vacio para que no se conecte doble al mio 
});




client.connect();
client.on("connected", async () => {
    console.log("🔄 Buscando usuarios guardados...");

    const users = await User.find();

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

async function twitchAPI(url) {
    return axios.get(url, {
        headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Authorization": `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`
        }
    });
}

async function getUserId(username) {
    const res = await twitchAPI(
        `https://api.twitch.tv/helix/users?login=${username}`
    );

    if (res.data.data.length === 0) return null;

    return res.data.data[0].id;
}

async function getRandomClip(userId) {
    const res = await twitchAPI(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${userId}`
    );

    const clips = res.data.data;

    if (!clips || clips.length === 0) return null;

    return clips[Math.floor(Math.random() * clips.length)];
}

// ========================
// COMANDOS
// ========================

client.on('message', async (channel, tags, message, self) => {
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
            const userId = await getUserId(usuario);

            if (!userId) {
                client.say(channel, "❌ Usuario no encontrado.");
                return;
            }

            const clip = await getRandomClip(userId);

            if (!clip) {
                client.say(channel, "⚠️ Ese canal no tiene clips.");
                return;
            }

            // Enviar al chat
            client.say(channel, `🎬 Clip de ${usuario}: ${clip.url}`);

            // ENVIAR AL OVERLAY DE OBS
            io.emit("newClip", clip.embed_url);

        } catch (error) {
            console.log("❌ Error obteniendo clip:");
            console.log(error.response?.data || error.message);
        }

    }
});
