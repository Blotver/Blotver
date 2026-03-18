// blotver\public\js\core\utils.js

window.Utils = {

  hexToRgb(hex){
    if(!hex) return "0,0,0"

    hex = hex.replace("#","")

    if(hex.length === 3){
      hex = hex.split("").map(c=>c+c).join("")
    }

    const bigint = parseInt(hex,16)

    const r = (bigint>>16)&255
    const g = (bigint>>8)&255
    const b = bigint&255

    return `${r},${g},${b}`
  },

  parseVariables(text, data = {}){

    if(!text) return ""

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
    }

    Object.keys(vars).forEach(key=>{
      if(vars[key] != null){
        text = text.replaceAll(key, vars[key])
      }
    })

    return text
  },

  norm(v){
    return v > 1 ? v/100 : v
  }

}