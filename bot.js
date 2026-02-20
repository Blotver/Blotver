require("dotenv").config();
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");
const Project = require("./models/Project");
const tmi = require("tmi.js");
const express = require("express");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// ========================
// SERVIDOR WEB
// ========================

const app = express();
console.log("🔥 Servidor cargado correctamente");
app.get("/api/clip-proxy", async (req, res) => {
    try {
        console.log("🎬 Entró al proxy");

        const videoUrl = req.query.url;
        if (!videoUrl) {
            return res.status(400).send("Falta url");
        }

        const response = await axios({
            method: "GET",
            url: videoUrl,
            responseType: "stream",
            headers: {
                "User-Agent": "Mozilla/5.0",
                Range: req.headers.range || ""
            }
        });

        res.setHeader("Content-Type", "video/mp4");
        response.data.pipe(res);

    } catch (error) {
        console.log("❌ Error en proxy:", error.message);
        res.sendStatus(500);
    }
});

app.use(express.static("public"));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {

    socket.on("joinProject", (projectId) => {
        socket.join(projectId);
        console.log("Overlay conectado al proyecto:", projectId);
    });

});

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

client.on("disconnected", (reason) => {
    console.log("❌ Bot desconectado:", reason);
});

client.on("reconnect", () => {
    console.log("🔁 Reintentando conexión...");
});

let syncing = false;

async function syncChannels() {
    if (syncing) return;
    syncing = true;

    try {
        console.log("🔄 Sincronizando canales con base de datos...");

        const activeUsers = await User.find({ botActive: true });
        const activeChannels = activeUsers.map(u => `#${u.login}`);
        const currentChannels = client.getChannels();

        for (const channel of activeChannels) {
            if (!currentChannels.includes(channel)) {
                console.log(`👉 Uniéndose a ${channel}`);
                await client.join(channel);
            }
        }

        for (const channel of currentChannels) {
            if (!activeChannels.includes(channel)) {
                console.log(`👋 Saliendo de ${channel}`);
                await client.part(channel);
            }
        }

        console.log("✅ Sincronización completa.");
    } finally {
        syncing = false;
    }
}

client.on("connected", async () => {
    setTimeout(async () => {
        await syncChannels();
    }, 1000);
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

        req.session.user = {
            id: user.id,
            login: user.login
        };

        res.redirect("/dashboard");

    } catch (err) {
        console.log("===== ERROR AUTH =====");
        console.log(err.response?.data || err.message);
        res.send("❌ Error en autenticación");
    }
});

const Widget = require("./models/Widget");

// Crear widget
app.post("/api/widgets", isAuthenticated, async (req, res) => {

    const project = await Project.findOne({
        _id: req.body.projectId,
        userId: req.session.user.id
    });

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    const widgetType = req.body.type || "text";

    let defaultData = {
        x: 100,
        y: 100
    };

    if (widgetType === "text") {
        defaultData = {
            ...defaultData,
            text: "Sample Text",
            color: "#000000",
            fontSize: 32
        };
    }

    if (widgetType === "shoutout") {
        defaultData = {
            ...defaultData,
            command: "!so",
            textTemplate: "Sigan a {user}",
            color: "#ffffff",
            fontSize: 40,
            duration: 10000
        };
    }

    const widget = await Widget.create({
        projectId: project._id,
        userId: req.session.user.id,
        name: req.body.name || "New Widget",
        type: widgetType,
        data: defaultData
    });

    res.json(widget);
});


// Obtener widgets de un project
app.get("/api/widgets/:projectId", isAuthenticated, async (req, res) => {
    const widgets = await Widget.find({
        projectId: req.params.projectId,
        userId: req.session.user.id
    });

    res.json(widgets);
});

// Actualizar widget
app.put("/api/widgets/:id", isAuthenticated, async (req, res) => {
    const widget = await Widget.findOneAndUpdate(
        { _id: req.params.id, userId: req.session.user.id },
        { data: req.body.data },
        { new: true }
    );

    res.json(widget);
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
// RUTAS API PROJECTS
// ========================

app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
        const project = await Project.create({
            userId: req.session.user.id,
            name: req.body.name || "New Project"
        });

        res.json(project);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating project" });
    }
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

app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
        const projects = await Project.find({
            userId: req.session.user.id
        });

        res.json(projects);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching projects" });
    }
});

// ========================
// OTRAS RUTAS
// ========================

app.get("/overlay/:projectId", (req, res) => {
    res.sendFile(path.join(__dirname, "public/overlay.html"));
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/dashboard/project", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public/project.html"));
});

app.get("/dashboard/profile", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public/profile.html"));
});

app.get("/dashboard", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

app.get("/dashboard/project/:id", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public/project-view.html"));
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// ========================
// DELETE ACCOUNT (ahora borra también proyectos)
// ========================

app.delete("/api/delete-account", isAuthenticated, async (req, res) => {

    await Widget.deleteMany({ userId: req.session.user.id });
    await Project.deleteMany({ userId: req.session.user.id });
    await User.deleteOne({ twitchId: req.session.user.id });

    await syncChannels();

    req.session.destroy(() => {
        res.json({ success: true });
    });
});
app.post("/api/toggle-bot", isAuthenticated, async (req, res) => {

    const userDB = await User.findOne({ twitchId: req.session.user.id });

    if (!userDB) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    userDB.botActive = !userDB.botActive;
    await userDB.save();

    await syncChannels();

    res.json({ botActive: userDB.botActive });
});

// ========================
// SERVIDOR
// ========================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🌐 Servidor iniciado en puerto ${PORT}`);
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


            // Buscar proyectos del dueño del canal
            const projects = await Project.find({ userId: userDB.twitchId });

            for (const project of projects) {

                console.log("Clip URL real:", clip.url);

                io.to(project._id.toString()).emit("newClip", {
                    videoUrl: clip.url,
                    duration: clip.duration
                });
            }


        } catch (error) {
            console.log(" Error obteniendo clip:");
            console.log(error.response?.data || error.message);
        }

    }
});