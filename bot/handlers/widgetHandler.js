const commands = require("../registry/commandRegistry");
const { getUserCommand } = require("../services/commandCache");

async function handleWidgetCommands(ctx) {

  const { channel, message, User } = ctx;

  const args = message.trim().split(" ");
  const command = args[0].toLowerCase();

  const channelName = channel.replace("#", "");

  const userDB = await User.findOne({ login: channelName });

  if (!userDB) return;

  const widget = getUserCommand(userDB.twitchId, command);

  if (!widget) return;

  const handler = commands[widget.type];

  if (!handler) {
    console.warn(`No handler for widget type: ${widget.type}`);
    return;
  }

  await handler(ctx, widget);

}

module.exports = handleWidgetCommands;