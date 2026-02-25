const tmi = require("tmi.js");
const EventEmitter = require("events");

global.overlayEmitter = new EventEmitter();

const handleShoutout = require("./commands/shoutout");

const client = new tmi.Client({
    connection: { reconnect: true },
    channels: ["tu_canal"]
});

client.connect();

client.on("message", (channel, tags, message, self) => {
    if (self) return;

    if (message.startsWith("!so")) {
        handleShoutout(client, channel, tags, message);
    }
});