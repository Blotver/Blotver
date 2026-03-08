const fs = require("fs");
const path = require("path");

const commands = {};

const commandsPath = path.join(__dirname, "../commands");

const files = fs.readdirSync(commandsPath);

for (const file of files) {
  if (!file.endsWith(".js")) continue;

  const commandName = file.replace(".js", "");
  commands[commandName] = require(path.join(commandsPath, file));
}

module.exports = commands;