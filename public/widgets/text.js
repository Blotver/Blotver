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

<div class="space-y-6 text-sm text-gray-300">


<!-- CONTENT -->
<div>

<label class="text-xs uppercase text-gray-500 tracking-wider">
Content
</label>

<input
data-field="text"
value="${widget.data.text}"
class="mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
/>

</div>



<!-- TYPOGRAPHY -->
<div class="space-y-3 border-t border-gray-800 pt-4">

<label class="text-xs uppercase text-gray-500 tracking-wider">
Typography
</label>

<input type="number"
data-field="fontSize"
value="${widget.data.fontSize}"
class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
/>


<select data-field="fontFamily"
class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">

<option>Inter</option>
<option>Montserrat</option>
<option>Roboto</option>
<option>Poppins</option>
<option>Oswald</option>
<option>Bebas Neue</option>
<option>Anton</option>

</select>


<select data-field="fontWeight"
class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">

<option value="300">Light</option>
<option value="400">Regular</option>
<option value="500">Medium</option>
<option value="700">Bold</option>
<option value="900">Black</option>

</select>


<label class="text-xs text-gray-500">
Letter Spacing
</label>

<input type="range"
min="-2"
max="20"
step="0.5"
data-field="letterSpacing"
value="${widget.data.letterSpacing}"
class="w-full"
/>

<label class="text-xs text-gray-500">
Line Height
</label>

<input type="range"
min="0.6"
max="3"
step="0.1"
data-field="lineHeight"
value="${widget.data.lineHeight}"
class="w-full"
/>

</div>



<!-- COLOR -->
<div class="space-y-3 border-t border-gray-800 pt-4">

<div class="space-y-4">

<label class="text-xs text-gray-400">
Mode
</label>

<div class="flex gap-4 text-xs">

<label class="flex items-center gap-2">
<input type="radio" name="colorMode" value="solid">
Solid
</label>

<label class="flex items-center gap-2">
<input type="radio" name="colorMode" value="gradient">
Gradient
</label>

</div>


<div id="solidColorBlock">

<label class="text-xs text-gray-400">
Text Color
</label>

<div id="textColorPicker"></div>

</div>


<div id="gradientBlock">

<label class="text-xs text-gray-400">
Gradient Start
</label>

<div id="gradientColor1"></div>

<label class="text-xs text-gray-400 mt-2 block">
Gradient End
</label>

<div id="gradientColor2"></div>

</div>

</div>

<select data-field="gradientDirection"
class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">

<option value="to right">Left → Right</option>
<option value="to left">Right → Left</option>
<option value="to bottom">Top → Bottom</option>
<option value="45deg">Diagonal</option>

</select>

</div>



<!-- STROKE -->
<div class="space-y-3 border-t border-gray-800 pt-4">

<label class="text-xs uppercase text-gray-500 tracking-wider">
Stroke
</label>

<input type="number"
data-field="strokeSize"
value="${widget.data.strokeSize}"
class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
/>

<div id="strokeColorPicker"></div>

</div>



<!-- SHADOW -->
<div class="space-y-3 border-t border-gray-800 pt-4">

<label class="text-xs uppercase text-gray-500 tracking-wider">
Glow / Shadow
</label>

<label class="flex items-center gap-2 text-xs">
<input type="checkbox" data-field="textShadow" ${widget.data.textShadow ? "checked" : ""}>
Enable Glow
</label>

<div id="shadowColorPicker"></div>

<label class="text-xs text-gray-500">Blur</label>

<input type="range"
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

registerWidget(window.TextWidget);