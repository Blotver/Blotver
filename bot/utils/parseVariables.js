module.exports = function parseVariables(text, data = {}) {
  const vars = {
    "{user}": data.user,
    "{userMention}": "@" + data.user,
    "{userUrl}": "https://twitch.tv/" + data.user,
    "{game}": data.game,
    "{clipUrl}": data.clipUrl,
    "{clipTitle}": data.clipTitle,
    "{clipViews}": data.clipViews,
    "{clipCreator}": data.clipCreator,
    "{channel}": data.channel,
    "{channelUrl}": "https://twitch.tv/" + data.channel,
  };

  Object.keys(vars).forEach((key) => {
    if (vars[key] !== undefined && vars[key] !== null) {
      text = text.replaceAll(key, vars[key]);
    }
  });

  return text;
};