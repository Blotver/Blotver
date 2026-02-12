require('dotenv').config();
const tmi = require('tmi.js');
const axios = require('axios');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// ========================
// SERVIDOR WEB PARA OBS
// ========================

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

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
    channels: [process.env.CHANNEL_NAME]
});

client.connect();

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
            client.say(channel, "❌ Error obteniendo clip.");
        }
    }
});
