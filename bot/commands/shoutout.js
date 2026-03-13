//blotver\bot\commands\shoutout.js

const parseVariables = require("../utils/parseVariables");

const userCache = new Map();
const clipCache = new Map();
const cooldowns = new Map();

module.exports = async function handleShoutout(ctx, widget) {
  const {
    client,
    io,
    channel,
    tags,
    message,
    User,
    Widget,
    getUserId,
    getRandomClip,
    twitchAPI,
  } = ctx;

  const args = message.trim().split(" ");
  const command = args[0].toLowerCase();

  const channelName = channel.replace("#", "");
  const userDB = await User.findOne({ login: channelName });
  if (!userDB) return;

  const matchedWidget = widget;

  const esMod = tags.mod || tags.badges?.broadcaster;
  if (!esMod) {
    client.say(channel, "⛔ Solo los moderadores pueden usar este comando.");
    return;
  }

  if (!args[1]) {
    client.say(
      channel,
      `❌ Debes escribir un usuario. Ejemplo: ${matchedWidget.data.command} nombre`,
    );
    return;
  }

  const usuario = args[1].replace("@", "").toLowerCase();

  const key = channel + ":so";

  if (cooldowns.has(key)) {
    const remaining = cooldowns.get(key) - Date.now();
    if (remaining > 0) return;
  }

  cooldowns.set(key, Date.now() + 10000);

  const userId = await getUserId(usuario, userDB);
  if (!userId) {
    client.say(channel, "❌ Usuario no encontrado.");
    return;
  }

  const clip = await getRandomClip(userId, userDB);

  if (!clip) {
    client.say(channel, "❌ Este usuario no tiene clips disponibles.");
    return;
  }

  const userInfoRes = await twitchAPI(
    `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`,
    userDB,
  );

  let gameName = "algo increíble";
  if (userInfoRes && userInfoRes.data.data.length > 0) {
    gameName = userInfoRes.data.data[0].game_name || "algo increíble";
  }

  let template =
    matchedWidget.data.textTemplate ||
    "🚀 Shoutout para @{user} jugando {game} 🎮";

  const mensaje = parseVariables(template, {
    user: usuario,
    game: gameName,
    channel: channelName,
    clipUrl: clip.url,
    clipTitle: clip.title,
    clipViews: clip.view_count,
    clipCreator: clip.creator_name,
  });

  client.say(channel, mensaje);

  const projectRoom = String(matchedWidget.projectId);

  console.log("🚀 Enviando clip al proyecto:", projectRoom);

  const childImages = await Widget.find({
    projectId: matchedWidget.projectId,
    type: "image",
  });

  const childTexts = await Widget.find({
    projectId: matchedWidget.projectId,
    type: "text",
  });

  console.log("🖼️ Child images encontradas:", childImages);

  console.log(
    "📦 Enviando images al overlay:",
    childImages.map((i) => i.data),
  );

  io.to(projectRoom).emit("newClip", {
    clipId: clip.id,

    x: matchedWidget.data.x,
    y: matchedWidget.data.y,
    width: matchedWidget.data.width,
    height: matchedWidget.data.height,

    user: usuario,
    game: gameName,

    channel: channelName,

    clipUrl: clip.url,
    clipTitle: clip.title,
    clipViews: clip.view_count,
    clipCreator: clip.creator_name,

    overlayText: matchedWidget.data.overlayText || "",

    animationIn: matchedWidget.data.animationIn || "fade",
    animationOut: matchedWidget.data.animationOut || "fade",
    duration: matchedWidget.data.duration || 10,

    images: childImages.map(img => img.data),
    texts: childTexts.map(txt => txt.data)
  });
};