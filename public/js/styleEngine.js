window.StyleEngine = {

  // -------------------------
  // UTILS
  // -------------------------
  hexToRgb(hex){

    if(!hex) return "0,0,0"

    hex = hex.replace("#","")
    const bigint = parseInt(hex,16)

    const r = (bigint>>16)&255
    const g = (bigint>>8)&255
    const b = bigint&255

    return `${r},${g},${b}`
  },

  // -------------------------
  // TEXT STYLES
  // -------------------------
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

  // -------------------------
  // IMAGE STYLES
  // -------------------------
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

  },

  // -------------------------
  // 🔥 RENDERERS (LO NUEVO)
  // -------------------------

  createText(d, content){

    const container = document.createElement("div")
    const inner = document.createElement("div")

    inner.innerHTML = content || ""

    // layout
    container.style.display = "flex"
    container.style.alignItems = "center"

    if (d.textAlign === "left")
      container.style.justifyContent = "flex-start"
    else if (d.textAlign === "right")
      container.style.justifyContent = "flex-end"
    else
      container.style.justifyContent = "center"

    // estilos
    this.applyText(inner, d)
    this.applyTextContainer(container, d)

    // fixes importantes
    inner.style.whiteSpace = "nowrap"
    inner.style.display = "inline-block"

    // animación
    if (d.animation && d.animation !== "none") {
      inner.classList.add("anim-" + d.animation)
    }

    container.appendChild(inner)

    return container
  },

  createImage(d){

    const img = document.createElement("img")

    this.applyImage(img, d)

    img.style.pointerEvents = "none"

    return img
  }

}