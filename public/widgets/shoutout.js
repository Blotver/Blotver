//blotver\public\widgets\shoutout.js

function hexToRgb(hex) {
  if (!hex) return "0,0,0";

  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }

  if (hex.length !== 6) return "0,0,0";

  const bigint = parseInt(hex, 16);

  return `${(bigint >> 16) & 255},${(bigint >> 8) & 255},${bigint & 255}`;
}

window.ShoutoutWidget = {
  type: "shoutout",

  defaultData: {
    x: 0.1,
    y: 0.1,
    width: 0.45,
    height: 0.30,

    command: "!so",
    textTemplate: "Sigan a {user} jugando {game}",

    duration: 10,
    animationIn: "fade",
    animationOut: "fade",

    borderRadius: 12,
    maxWidth: "80%",
  },

  renderCanvas(widget) {

    const el = document.createElement("div")
    el.classList.add("anim") // 🔥 base

    const canvas = document.getElementById("canvas")

    function applyAnimationIn() {
      el.classList.remove(
        "anim-in-fade",
        "anim-in-slide",
        "anim-in-zoom",
        "anim-in-pop"
      )

      el.classList.add("anim-in-" + (widget.data.animationIn || "fade"))
    }

    function applyAnimationOut() {
      el.classList.remove(
        "anim-out-fade",
        "anim-out-slide",
        "anim-out-zoom",
        "anim-out-pop"
      )

      el.classList.add("anim-out-" + (widget.data.animationOut || "fade"))
    }

    function norm(v) {
      return v > 1 ? v / 100 : v
    }

    function getChildrenHTML() {

      const children = (window.widgets || []).filter(
        (w) => w.parent === widget._id
      )

      let html = ""

      children.forEach(child => {

        if (child.type === "image" && child.data.url) {

          const cx = norm(child.data.x)
          const cy = norm(child.data.y)
          const cw = norm(child.data.width)
          const ch = norm(child.data.height)

          html += `
<img src="${child.data.url}"
style="
position:absolute;
left:${(cx - widget.data.x) * canvas.clientWidth}px;
top:${(cy - widget.data.y) * canvas.clientHeight}px;
width:${cw * canvas.clientWidth}px;
height:${ch * canvas.clientHeight}px;
object-fit:${child.data.objectFit || "cover"};
pointer-events:none;
">
`
        }

      })

      return html
    }

    function updateView() {

      const canvasW = canvas.clientWidth
      const canvasH = canvas.clientHeight

      el.style.width = widget.data.width * canvasW + "px"
      el.style.height = widget.data.height * canvasH + "px"

      const text =
        widget.data.overlayText ||
        widget.data.textTemplate ||
        "Sigan a {user} jugando {game}"

      const strokeSize = widget.data.strokeSize || 2
      const strokeColor = widget.data.strokeColor || "#000"
      const textPosition = widget.data.textPosition || "top"

      let positionStyle = ""

      if (textPosition === "top") {
        positionStyle = `top:20px;left:50%;transform:translateX(-50%);`
      }

      if (textPosition === "center") {
        positionStyle = `top:50%;left:50%;transform:translate(-50%,-50%);`
      }

      if (textPosition === "bottom") {
        positionStyle = `bottom:20px;left:50%;transform:translateX(-50%);`
      }

      el.innerHTML = `
<div class="clip-area" style="
flex:1;
position:relative;
display:flex;
align-items:center;
justify-content:center;
background:#000;
">

<div style="
position:absolute;
inset:0;
background:linear-gradient(135deg,#111,#222);
border-radius:${widget.data.borderRadius}px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.6);
"></div>

<div style="
position:absolute;
${positionStyle}
text-align:${widget.data.textAlign || "center"};
max-width:${widget.data.maxWidth};
font-weight:700;
font-size:${widget.data.fontSize || 40}px;
color:${widget.data.textColor || "#fff"};
-webkit-text-stroke:${strokeSize}px ${strokeColor};
background: rgba(${hexToRgb(widget.data.backgroundColor)}, ${widget.data.backgroundOpacity});
padding:6px 12px;
border-radius:${widget.data.borderRadius}px;
pointer-events:none;
">
${text}
</div>

${getChildrenHTML()}

</div>
`
    }

    updateView()

    // 🎬 IN animation
    applyAnimationIn()

    // 🎬 OUT animation
    setTimeout(() => {
      applyAnimationOut()
    }, (widget.data.duration || 10) * 1000)

    el.updatePreview = () => {
      updateView()
      applyAnimationIn()
    }

    return el
  },

  renderConfig(widget, content, update) {

    content.innerHTML = `
<div class="config-root">

<div class="config-card">
<div class="config-title">Basic</div>

<input id="cfgCommand" class="config-input" value="${widget.data.command || ""}">
<input id="cfgTemplate" class="config-input" value="${widget.data.textTemplate || ""}">
</div>

<div class="config-card">
<div class="config-title">Display</div>

<input type="number" id="cfgDuration" class="config-input" value="${widget.data.duration || 10}">
</div>

<div class="config-card">
<div class="config-title">Animations</div>

<select id="cfgAnimIn" class="config-input">
<option value="fade">Fade</option>
<option value="slide">Slide</option>
<option value="zoom">Zoom</option>
<option value="pop">Pop</option>
</select>

<select id="cfgAnimOut" class="config-input">
<option value="fade">Fade</option>
<option value="slide">Slide</option>
<option value="zoom">Zoom</option>
<option value="pop">Pop</option>
</select>

</div>
</div>
`

    document.getElementById("cfgAnimIn").value = widget.data.animationIn || "fade"
    document.getElementById("cfgAnimOut").value = widget.data.animationOut || "fade"

    document.getElementById("cfgCommand")
      .addEventListener("input", e => update({ command: e.target.value }))

    document.getElementById("cfgTemplate")
      .addEventListener("input", e => update({ textTemplate: e.target.value }))

    document.getElementById("cfgDuration")
      .addEventListener("input", e => update({ duration: parseInt(e.target.value) }))

    document.getElementById("cfgAnimIn")
      .addEventListener("change", e => update({ animationIn: e.target.value }))

    document.getElementById("cfgAnimOut")
      .addEventListener("change", e => update({ animationOut: e.target.value }))
  },
}

registerWidget(window.ShoutoutWidget)