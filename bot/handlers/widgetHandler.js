module.exports = async function handleWidgetCommands(ctx) {

    const {
        channel,
        message,
        User,
        Widget
    } = ctx;

    const args = message.trim().split(" ");
    const command = args[0].toLowerCase();

    const channelName = channel.replace("#", "");
    const userDB = await User.findOne({ login: channelName });
    if (!userDB) return;

    const widgets = await Widget.find({
        userId: userDB.twitchId
    });

    const matchedWidget = widgets.find(w =>
        w.data.command?.toLowerCase() === command
    );

    if (!matchedWidget) return;

    // Delegar por tipo
    try {

        const handler = require(`../commands/${matchedWidget.type}.js`);
        await handler(ctx, matchedWidget);

    } catch (err) {
        console.log("❌ No existe handler para tipo:", matchedWidget.type);
    }
};