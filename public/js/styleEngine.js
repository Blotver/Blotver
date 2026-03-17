window.StyleEngine = {

  hexToRgb(hex){

    if(!hex) return "0,0,0"

    hex = hex.replace("#","")
    const bigint = parseInt(hex,16)

    const r = (bigint>>16)&255
    const g = (bigint>>8)&255
    const b = bigint&255

    return `${r},${g},${b}`
  },


  applyText(el,d){

    if(!el || !d) return

    el.style.fontSize = d.fontSize+"px"
    el.style.fontWeight = d.fontWeight
    el.style.fontFamily = d.fontFamily+",sans-serif"
    el.style.letterSpacing = d.letterSpacing+"px"
    el.style.lineHeight = d.lineHeight
    el.style.textAlign = d.textAlign

    el.style.webkitTextStroke =
      `${d.strokeSize}px ${d.strokeColor}`

    if(d.gradient){

      el.style.background =
        `linear-gradient(${d.gradientDirection},${d.gradientColor1},${d.gradientColor2})`

      el.style.webkitBackgroundClip="text"
      el.style.webkitTextFillColor="transparent"

    }else{

      el.style.color = d.textColor

    }

    if(d.textShadow){

      el.style.textShadow =
        `0 0 ${d.shadowBlur}px ${d.shadowColor}`

    }

  },


  applyTextContainer(el,d){

    const rgb = this.hexToRgb(d.backgroundColor)

    el.style.padding =
      `${d.paddingY}px ${d.paddingX}px`

    el.style.background =
      `rgba(${rgb},${d.backgroundOpacity})`

    el.style.borderRadius =
      d.borderRadius+"px"

  },


  applyImage(img,d){

    img.style.objectFit = d.objectFit || "cover"

    img.style.borderRadius =
      d.borderRadius+"px"

    img.style.opacity =
      d.opacity ?? 1

    img.style.boxShadow =
      d.shadow
        ? `0 10px 30px rgba(0,0,0,${d.shadow/100})`
        : "none"

    if(d.url && img.src !== d.url)
      img.src = d.url

  }

}