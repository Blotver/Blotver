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

  const widgets = await Widget.find({
    userId: userDB.twitchId,
    type: "shoutout",
  });

  const matchedWidget = widgets.find(
    (w) => w.data.command?.toLowerCase() === command,
  );

  if (!matchedWidget) return;

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

  const mensaje = template
    .replaceAll("{user}", usuario)
    .replaceAll("{game}", gameName);

  client.say(channel, mensaje);

  const projectRoom = String(matchedWidget.projectId);

  console.log("🚀 Enviando clip al proyecto:", projectRoom);

  const childImages = await Widget.find({
    projectId: matchedWidget.projectId,
    parent: matchedWidget._id,
    type: "image",
  });

  io.to(projectRoom).emit("newClip", {
    clipId: clip.id,
    user: usuario,
    game: gameName,
    overlayText: matchedWidget.data.overlayText || "",
    animationIn: matchedWidget.data.animationIn || "fade",
    animationOut: matchedWidget.data.animationOut || "fade",
    duration: matchedWidget.data.duration || 10,
    images: childImages.map((i) => i.data),
  });
};
