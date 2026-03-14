window.TextWidget = {
  type: "text",

  defaultData: {
    x: 0.2,
    y: 0.2,
    width: 0.2,
    height: 0.1,

    text: "Sample Text",

    fontSize: 40,
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

    const el = document.createElement("div");
    const data = widget.data;

    function hexToRgb(hex) {
      if (!hex) return "0,0,0";
      hex = hex.replace("#", "");
      const bigint = parseInt(hex, 16);

      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;

      return `${r},${g},${b}`;
    }

    el.style.width = "100%";
    el.style.height = "100%";

    el.style.display = "flex";
    el.style.alignItems = "center";

    if (data.textAlign === "left") el.style.justifyContent = "flex-start";
    else if (data.textAlign === "right") el.style.justifyContent = "flex-end";
    else el.style.justifyContent = "center";

    el.style.padding = `${data.paddingY}px ${data.paddingX}px`;

    const rgb = hexToRgb(data.backgroundColor);

    el.style.background = `rgba(${rgb},${data.backgroundOpacity})`;

    el.style.borderRadius = data.borderRadius + "px";

    let textStyle = `
      font-size:${data.fontSize}px;
      font-weight:${data.fontWeight};
      font-family:${data.fontFamily}, sans-serif;
      letter-spacing:${data.letterSpacing}px;
      line-height:${data.lineHeight};
      text-align:${data.textAlign};
      -webkit-text-stroke:${data.strokeSize}px ${data.strokeColor};
      white-space:nowrap;
    `;

    if (data.gradient) {

      textStyle += `
        background: linear-gradient(${data.gradientDirection}, ${data.gradientColor1}, ${data.gradientColor2});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      `;

    } else {

      textStyle += `color:${data.textColor};`;

    }

    if (data.textShadow) {

      textStyle += `
        text-shadow:0 0 ${data.shadowBlur}px ${data.shadowColor};
      `;

    }

    el.innerHTML = `
      <div style="${textStyle}">
        ${data.text}
      </div>
    `;

    return el;

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


<!-- COLOR -->
<div class="config-card">

<div class="config-title">
Color
</div>

<label class="config-label">
Mode
</label>

<div class="color-mode">

<button class="mode-btn active" data-mode="solid">

<svg width="16" height="16" viewBox="0 0 24 24">
<rect x="4" y="4" width="16" height="16" fill="white"/>
</svg>

<span>Solid</span>

</button>


<button class="mode-btn" data-mode="gradient">

<svg width="16" height="16" viewBox="0 0 24 24">
<defs>
<linearGradient id="g">
<stop offset="0%" stop-color="#fff"/>
<stop offset="100%" stop-color="#ff00ff"/>
</linearGradient>
</defs>

<rect x="4" y="4" width="16" height="16" fill="url(#g)"/>
</svg>

<span>Gradient</span>

</button>

</div>


<div id="solidColorBlock">

<label class="config-label">
Text Color
</label>

<div id="textColorPicker"></div>

</div>


<div id="gradientBlock">

<label class="config-label">
Gradient Start
</label>

<div id="gradientColor1"></div>

<label class="config-label">
Gradient End
</label>

<div id="gradientColor2"></div>

</div>


<select
data-field="gradientDirection"
class="config-input">

<option value="to right">Left → Right</option>
<option value="to left">Right → Left</option>
<option value="to bottom">Top → Bottom</option>
<option value="45deg">Diagonal</option>

</select>

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


<!-- SHADOW -->
<div class="config-card">

<div class="config-title">
Glow / Shadow
</div>

<label class="flex items-center gap-2 text-xs">
<input
type="checkbox"
data-field="textShadow"
${widget.data.textShadow ? "checked" : ""}
>
Enable Glow
</label>

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
`;

    container.querySelectorAll("[data-field]").forEach(input => {

      input.addEventListener("input", e => {

        const field = e.target.dataset.field;

        let value;

        if (input.type === "checkbox") value = input.checked;
        else value = e.target.value;

        if (input.type === "number" || input.type === "range")
          value = parseFloat(value);

        update({ [field]: value });

      });

    });

    const solidBlock = container.querySelector("#solidColorBlock");
    const gradientBlock = container.querySelector("#gradientBlock");

    function updateMode() {

      if (widget.data.gradient) {

        solidBlock.style.display = "none";
        gradientBlock.style.display = "block";

      } else {

        solidBlock.style.display = "block";
        gradientBlock.style.display = "none";

      }

    }

    updateMode();

    container.querySelectorAll("input[name=colorMode]").forEach(r => {

      r.checked = widget.data.gradient
        ? r.value === "gradient"
        : r.value === "solid";

      r.addEventListener("change", e => {

        update({ gradient: e.target.value === "gradient" });
        updateMode();

      });

    });

    createColorPicker(
      container.querySelector("#textColorPicker"),
      widget.data.textColor,
      color => update({ textColor: color })
    );

    createColorPicker(
      container.querySelector("#gradientColor1"),
      widget.data.gradientColor1,
      color => update({ gradientColor1: color })
    );

    createColorPicker(
      container.querySelector("#gradientColor2"),
      widget.data.gradientColor2,
      color => update({ gradientColor2: color })
    );

    createColorPicker(
      container.querySelector("#strokeColorPicker"),
      widget.data.strokeColor,
      color => update({ strokeColor: color })
    );

    createColorPicker(
      container.querySelector("#shadowColorPicker"),
      widget.data.shadowColor,
      color => update({ shadowColor: color })
    );

  }

};

container.querySelectorAll(".mode-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    const mode = btn.dataset.mode;

    update({ gradient: mode === "gradient" });

    container.querySelectorAll(".mode-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

  });

});

registerWidget(window.TextWidget);