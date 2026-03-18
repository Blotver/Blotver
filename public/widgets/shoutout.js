window.ShoutoutWidget = {
  type: "shoutout",

  defaultData: {
    x: 0.1,
    y: 0.1,
    width: 0.45,
    height: 0.30,

    command: "!so",
    textTemplate: "Sigan a {user} jugando {game}",

    duration: 30,
    animationIn: "fade",
    animationOut: "fade",
    borderRadius: 12,
    maxWidth: "80%",
  },

  renderCanvas(widget) {

    const el = document.createElement("div")
    const canvas = document.getElementById("canvas")

    const canvasW = canvas.clientWidth
    const canvasH = canvas.clientHeight

    el.style.width = widget.data.width * canvasW + "px"
    el.style.height = widget.data.height * canvasH + "px"

    el.style.display = "flex"
    el.style.flexDirection = "column"
    el.style.background = "#0f0f0f"
    el.style.borderRadius = widget.data.borderRadius + "px"
    el.style.overflow = "hidden"
    el.style.position = "relative"

    const clipArea = document.createElement("div")
    clipArea.style.flex = "1"
    clipArea.style.position = "relative"
    clipArea.style.background = "#000"

    clipArea.innerHTML = `
      <div style="
        position:absolute;
        inset:0;
        background:linear-gradient(135deg,#111,#222);
        border-radius:${widget.data.borderRadius}px;
      "></div>

      <div style="
        position:absolute;
        top:8px;
        left:8px;
        background:rgba(0,0,0,0.7);
        color:white;
        font-size:11px;
        padding:3px 6px;
        border-radius:4px;
      ">TWITCH CLIP</div>

      <div style="
        position:absolute;
        bottom:10px;
        left:50%;
        transform:translateX(-50%);
        color:rgba(255,255,255,0.6);
        font-size:13px;
      ">Preview Clip Area</div>
    `

    el.appendChild(clipArea)

    return el

  },

  renderConfig(widget, content, update) {
    content.innerHTML = `
<div class="config-root">

<div class="config-card">
<div class="config-title">Basic</div>

<label class="config-label">Command</label>
<input id="cfgCommand" class="config-input" value="${widget.data.command || ""}">

<label class="config-label">Text Template</label>
<input id="cfgTemplate" class="config-input" value="${widget.data.textTemplate || ""}">
</div>

<div class="config-card">
<div class="config-title">Display</div>

<label class="config-label">Duration</label>
<input type="number" id="cfgDuration" class="config-input" value="${widget.data.duration || 10}">
</div>

</div>
`

    document.getElementById("cfgCommand")
      .addEventListener("input", e => update({ command: e.target.value }))

    document.getElementById("cfgTemplate")
      .addEventListener("input", e => update({ textTemplate: e.target.value }))

    document.getElementById("cfgDuration")
      .addEventListener("input", e => update({ duration: parseInt(e.target.value) }))
  }
}

registerWidget(window.ShoutoutWidget)