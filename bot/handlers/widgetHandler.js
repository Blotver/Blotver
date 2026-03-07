module.exports = async function handleWidgetCommands(ctx) {
  const { channel, message, User, Widget } = ctx;

  const args = message.trim().split(" ");
  const command = args[0].toLowerCase();

  const channelName = channel.replace("#", "");
  const userDB = await User.findOne({ login: channelName });
  if (!userDB) return;

  const widgets = await Widget.find({
    userId: userDB.twitchId,
  });

  const matchedWidget = widgets.find(
    (w) => w.data.command?.toLowerCase() === command,
  );

  if (!matchedWidget) return;

  // Delegar por tipo
  try {
    const path = `../commands/${matchedWidget.type}.js`;
    console.log("🔎 Intentando cargar:", path);

    const handler = require(path);
    await handler(ctx, matchedWidget);
  } catch (err) {
    console.log("❌ Error cargando handler:", matchedWidget.type);
    console.log(err);
  }
};
