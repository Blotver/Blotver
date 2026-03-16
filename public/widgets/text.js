window.TextWidget = {

  type: "text",

  defaultData: {

    x: 0.2,
    y: 0.2,
    width: 0.2,
    height: 0.1,

    text: "Sample Text",

    fontSize: 30,
    fontWeight: "700",
    fontFamily: "Inter",
    letterSpacing: 0,
    lineHeight: 1,

    textColor: "#ffffff",

    gradient: false,
    gradientColor1: "#ffffff",
    gradientColor2: "#ff00ff",
    gradientDirection: "to right",

    strokeSize: 0,
    strokeColor: "#000000",

    textShadow: false,
    shadowColor: "#000000",
    shadowBlur: 10,

    backgroundColor: "#000000",
    backgroundOpacity: 0,

    borderRadius: 0,

    textAlign: "center",

    paddingX: 10,
    paddingY: 6

  },

  renderCanvas(widget) {

    const el = document.createElement("div")
    const d = widget.data

    function hexToRgb(hex) {

      hex = hex.replace("#", "")
      const bigint = parseInt(hex, 16)

      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255

      return `${r},${g},${b}`

    }

    el.style.width = "100%"
    el.style.height = "100%"
    el.style.display = "flex"
    el.style.alignItems = "center"

    if (d.textAlign === "left") el.style.justifyContent = "flex-start"
    else if (d.textAlign === "right") el.style.justifyContent = "flex-end"
    else el.style.justifyContent = "center"

    el.style.padding = `${d.paddingY}px ${d.paddingX}px`

    const rgb = hexToRgb(d.backgroundColor)

    el.style.background = `rgba(${rgb},${d.backgroundOpacity})`
    el.style.borderRadius = d.borderRadius + "px"

    let textStyle = `
font-size:${d.fontSize}px;
font-weight:${d.fontWeight};
font-family:${d.fontFamily},sans-serif;
letter-spacing:${d.letterSpacing}px;
line-height:${d.lineHeight};
text-align:${d.textAlign};
-webkit-text-stroke:${d.strokeSize}px ${d.strokeColor};
white-space:nowrap;
`

    if (d.gradient) {

      textStyle += `
background:linear-gradient(${d.gradientDirection},${d.gradientColor1},${d.gradientColor2});
-webkit-background-clip:text;
-webkit-text-fill-color:transparent;
`

    } else {

      textStyle += `color:${d.textColor};`

    }

    if (d.textShadow) {

      textStyle += `text-shadow:0 0 ${d.shadowBlur}px ${d.shadowColor};`

    }

    el.innerHTML = `<div style="${textStyle}">${d.text}</div>`

    return el

  },

  renderConfig(widget, container, update) {

    container.innerHTML = `

<div class="config-root">

<!-- CONTENT -->
<div class="config-card">

<div class="config-title">
Content
</div>

<input
data-field="text"
value="${widget.data.text}"
class="config-input"
/>

</div>



<!-- TYPOGRAPHY -->
<div class="config-card">

<div class="config-title">
Typography
</div>

<input
type="number"
data-field="fontSize"
value="${widget.data.fontSize}"
class="config-input"
/>

<select
data-field="fontFamily"
class="config-input">

<option>Inter</option>
<option>Montserrat</option>
<option>Roboto</option>
<option>Poppins</option>
<option>Oswald</option>
<option>Bebas Neue</option>
<option>Anton</option>

</select>


<select
data-field="fontWeight"
class="config-input">

<option value="300">Light</option>
<option value="400">Regular</option>
<option value="500">Medium</option>
<option value="700">Bold</option>
<option value="900">Black</option>

</select>


<label class="config-label">
Letter Spacing
</label>

<input
type="range"
min="-2"
max="20"
step="0.5"
data-field="letterSpacing"
value="${widget.data.letterSpacing}"
class="w-full"
/>


<label class="config-label">
Line Height
</label>

<input
type="range"
min="0.6"
max="3"
step="0.1"
data-field="lineHeight"
value="${widget.data.lineHeight}"
class="w-full"
/>

</div>



<!-- FILL -->
<div class="config-card">

<div class="config-title">
Fill
</div>

<div class="mode-switch flex gap-2">

<button
class="mode-btn flex-1 ${!widget.data.gradient ? "active" : ""}"
data-mode="solid">
Solid
</button>

<button
class="mode-btn flex-1 ${widget.data.gradient ? "active" : ""}"
data-mode="gradient">
Gradient
</button>

</div>


<div id="solidBlock">

<label class="config-label">
Text Color
</label>

<div id="textColorPicker"></div>

</div>


<div id="gradientBlock">

<div class="grid grid-cols-2 gap-2">

<div>
<label class="config-label">
Start
</label>
<div id="gradientColor1"></div>
</div>

<div>
<label class="config-label">
End
</label>
<div id="gradientColor2"></div>
</div>

</div>

<label class="config-label">
Direction
</label>

<select
data-field="gradientDirection"
class="config-input">

<option value="to right">Left → Right</option>
<option value="to left">Right → Left</option>
<option value="to bottom">Top → Bottom</option>
<option value="45deg">Diagonal</option>

</select>

</div>

</div>



<!-- STROKE -->
<div class="config-card">

<div class="config-title">
Stroke
</div>

<input
type="number"
data-field="strokeSize"
value="${widget.data.strokeSize}"
class="config-input"
/>

<div id="strokeColorPicker"></div>

</div>



<!-- EFFECTS -->
<!-- EFFECTS -->
<div class="config-card">

<div class="config-title">
Glow / Shadow
</div>

<div class="mode-switch flex gap-2">

<button
class="glow-btn flex-1 ${!widget.data.textShadow ? "active" : ""}"
data-glow="off">
Off
</button>

<button
class="glow-btn flex-1 ${widget.data.textShadow ? "active" : ""}"
data-glow="on">
Glow
</button>

</div>


<div id="glowControls">

<div id="shadowColorPicker"></div>

<label class="config-label">
Blur
</label>

<input
type="range"
min="0"
max="80"
data-field="shadowBlur"
value="${widget.data.shadowBlur}"
class="w-full"
/>

</div>

</div>



<!-- BACKGROUND -->
<div class="config-card">

<div class="config-title">
Background
</div>

<div id="bgColorPicker"></div>

<label class="config-label">
Opacity
</label>

<input
type="range"
min="0"
max="1"
step="0.01"
data-field="backgroundOpacity"
value="${widget.data.backgroundOpacity}"
class="w-full"
/>

<label class="config-label">
Radius
</label>

<input
type="range"
min="0"
max="100"
data-field="borderRadius"
value="${widget.data.borderRadius}"
class="w-full"
/>

</div>

</div>
`

    container.querySelectorAll("[data-field]").forEach(input => {

      input.addEventListener("input", e => {

        const field = e.target.dataset.field

        let value

        if (input.type === "checkbox") value = input.checked
        else value = e.target.value

        if (input.type === "number" || input.type === "range")
          value = parseFloat(value)

        update({ [field]: value })

      })

    })

    const solidBlock = container.querySelector("#solidBlock")
    const gradientBlock = container.querySelector("#gradientBlock")

    function updateMode() {

      if (widget.data.gradient) {

        solidBlock.style.display = "none"
        gradientBlock.style.display = "block"

      } else {

        solidBlock.style.display = "block"
        gradientBlock.style.display = "none"

      }

    }

    updateMode()

    container.querySelectorAll(".mode-btn").forEach(btn => {

      btn.addEventListener("click", () => {

        const mode = btn.dataset.mode

        update({ gradient: mode === "gradient" })

        container.querySelectorAll(".mode-btn")
          .forEach(b => b.classList.remove("active"))

        btn.classList.add("active")

        updateMode()

      })

    })

    const glowControls = container.querySelector("#glowControls")

    function updateGlow() {

      if (widget.data.textShadow) {

        glowControls.style.display = "block"

      } else {

        glowControls.style.display = "none"

      }

    }

    updateGlow()

    container.querySelectorAll(".glow-btn").forEach(btn => {

      btn.addEventListener("click", () => {

        const enabled = btn.dataset.glow === "on"

        update({ textShadow: enabled })

        container.querySelectorAll(".glow-btn")
          .forEach(b => b.classList.remove("active"))

        btn.classList.add("active")

        updateGlow()

      })

    })

    createColorPicker(
      container.querySelector("#textColorPicker"),
      widget.data.textColor,
      c => update({ textColor: c })
    )

    createColorPicker(
      container.querySelector("#gradientColor1"),
      widget.data.gradientColor1,
      c => update({ gradientColor1: c })
    )

    createColorPicker(
      container.querySelector("#gradientColor2"),
      widget.data.gradientColor2,
      c => update({ gradientColor2: c })
    )

    createColorPicker(
      container.querySelector("#strokeColorPicker"),
      widget.data.strokeColor,
      c => update({ strokeColor: c })
    )

    createColorPicker(
      container.querySelector("#shadowColorPicker"),
      widget.data.shadowColor,
      c => update({ shadowColor: c })
    )

    createColorPicker(
      container.querySelector("#bgColorPicker"),
      widget.data.backgroundColor,
      c => update({ backgroundColor: c })
    )

  }

}

registerWidget(window.TextWidget)