const Widget = require("../../models/Widget");

const commandCache = new Map();

async function loadUserCommands(userId) {

  const widgets = await Widget.find({
    userId: userId,
    "data.command": { $exists: true }
  });

  const userCommands = new Map();

  for (const widget of widgets) {

    const command = widget.data.command;

    userCommands.set(command, widget);

  }

  commandCache.set(userId, userCommands);
}

function getUserCommand(userId, command) {

  const userCommands = commandCache.get(userId);

  if (!userCommands) return null;

  return userCommands.get(command);
}

module.exports = {
  loadUserCommands,
  getUserCommand
};