//blotver\public\widgets\text.js

window.TextWidget = {
  type: "text",

defaultData: {
    x: 0.2,
    y: 0.2,
    width: 0.2,
    height: 0.1,

    text: "Sample Text",

    fontSize: 40,
    textColor: "#ffffff",

    strokeSize: 0,
    strokeColor: "#000000",

    backgroundColor: "#000000",
    backgroundOpacity: 0,

    borderRadius: 0,

    textAlign: "center",
    fontWeight: "700",

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
    el.style.justifyContent =
      data.textAlign === "left"
        ? "flex-start"
        : data.textAlign === "right"
        ? "flex-end"
        : "center";

    el.style.padding = `${data.paddingY}px ${data.paddingX}px`;

    const rgb = hexToRgb(data.backgroundColor);

    el.style.background = `rgba(${rgb},${data.backgroundOpacity || 0})`;

    el.style.borderRadius = (data.borderRadius || 0) + "px";

    el.innerHTML = `
<div style="
font-size:${data.fontSize}px;
color:${data.textColor};
font-weight:${data.fontWeight};
text-align:${data.textAlign};
-webkit-text-stroke:${data.strokeSize}px ${data.strokeColor};
white-space:nowrap;
">
${data.text || ""}
</div>
`;

    return el;
  },

  renderConfig(widget, container, update) {

    container.innerHTML = `

<div class="space-y-6 text-sm text-gray-300">

<!-- TEXT -->
<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Text
</label>

<input
data-field="text"
value="${widget.data.text}"
class="mt-2 w-full bg-gray-900 border border-gray-700
rounded-md px-3 py-2 text-sm"
/>
</div>

<!-- FONT SIZE -->
<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Font Size
</label>

<input
type="number"
data-field="fontSize"
value="${widget.data.fontSize}"
class="mt-2 w-full bg-gray-900 border border-gray-700
rounded-md px-3 py-2 text-sm"
/>
</div>

<!-- TEXT COLOR -->
<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Text Color
</label>

<input
type="color"
data-field="textColor"
value="${widget.data.textColor}"
class="mt-2 w-full"
/>
</div>

<!-- STROKE -->
<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Stroke Size
</label>

<input
type="number"
data-field="strokeSize"
value="${widget.data.strokeSize}"
class="mt-2 w-full bg-gray-900 border border-gray-700
rounded-md px-3 py-2 text-sm"
/>
</div>

<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Stroke Color
</label>

<input
type="color"
data-field="strokeColor"
value="${widget.data.strokeColor}"
class="mt-2 w-full"
/>
</div>

<!-- BACKGROUND -->
<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Background
</label>

<input
type="color"
data-field="backgroundColor"
value="${widget.data.backgroundColor}"
class="mt-2 w-full"
/>

<input
type="range"
min="0"
max="1"
step="0.01"
data-field="backgroundOpacity"
value="${widget.data.backgroundOpacity}"
class="w-full mt-2"
/>
</div>

<!-- ALIGN -->
<div>
<label class="text-xs uppercase text-gray-500 tracking-wider">
Align
</label>

<select
data-field="textAlign"
class="mt-2 w-full bg-gray-900 border border-gray-700
rounded-md px-3 py-2 text-sm"
>

<option value="left">Left</option>
<option value="center">Center</option>
<option value="right">Right</option>

</select>
</div>

</div>
`;

    container.querySelectorAll("[data-field]").forEach(input => {

      input.addEventListener("input", (e) => {

        const field = e.target.dataset.field;

        let value = e.target.value;

        if (input.type === "number" || input.type === "range") {
          value = parseFloat(value);
        }

        update({
          [field]: value
        });

      });

    });

  }
};

registerWidget(window.TextWidget);