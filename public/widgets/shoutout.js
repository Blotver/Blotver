function detectParent(widget) {

  const others = (window.widgets || []).filter(
    (w) => w._id !== widget._id
  );

  let parent = null;

  for (const other of others) {

    const width = other.data.width || 400;
    const height = other.data.height || 300;

    const insideX =
      widget.data.x >= other.data.x &&
      widget.data.x <= other.data.x + width;

    const insideY =
      widget.data.y >= other.data.y &&
      widget.data.y <= other.data.y + height;

    if (insideX && insideY) {
      parent = other._id;
      break;
    }

  }

  widget.parent = parent;
}

function hexToRgb(hex) {
  if (!hex) return "0,0,0";

  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (hex.length !== 6) return "0,0,0";

  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r},${g},${b}`;
}

// Inject color picker styles
if (!document.getElementById("color-picker-styles")) {
  const style = document.createElement("style");
  style.id = "color-picker-styles";

  style.textContent = `
.color-field{
display:flex;
align-items:center;
gap:10px;
}

.color-preview{
width:32px;
height:32px;
border-radius:6px;
border:1px solid rgba(255,255,255,0.2);
cursor:pointer;
box-shadow:0 0 0 1px rgba(0,0,0,0.5) inset;
}

.color-picker{
position:absolute;
width:240px;
background:#1a1a1a;
border-radius:10px;
padding:12px;
box-shadow:0 10px 30px rgba(0,0,0,0.5);
z-index:9999;
}
`;

  document.head.appendChild(style);
}

window.ShoutoutWidget = {
  type: "shoutout",

  defaultData: {
    x: 100,
    y: 100,

    width: 900,
    height: 500,

    command: "!so",
    textTemplate: "Sigan a {user} jugando {game}",

    duration: 30,
    overlayText: "",
    animationIn: "fade",
    animationOut: "fade",

    fontSize: 20,
    textColor: "#ffffff",
    strokeColor: "#000000",
    strokeSize: 2,
    backgroundColor: "#000000",
    backgroundOpacity: 0.4,
    borderRadius: 12,

    textAlign: "center",
    textPosition: "top",
    maxWidth: "80%",
  },

  renderCanvas(widget) {
    const children = (window.widgets || []).filter(
      (w) => w.parent === widget._id,
    );

    const el = document.createElement("div");

    el.style.width = widget.data.width + "px";
    el.style.height = widget.data.height + "px";

    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.background = "#0f0f0f";
    el.style.outline = "1px dashed rgba(255,255,255,0.15)";
    el.style.outlineOffset = "-1px";
    el.style.borderRadius = widget.data.borderRadius + "px";
    el.style.border = "1px solid rgba(255,255,255,0.06)";
    el.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
    el.style.overflow = "hidden";

    function parseVariables(text, data = {}) {
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
    }

    function getChildrenHTML() {
      let html = "";

      children.forEach((child) => {
        if (child.type === "image" && child.data.url) {
          html += `
      <img src="${child.data.url}"
      style="
        position:absolute;
        left:${child.data.x - widget.data.x}px;
        top:${child.data.y - widget.data.y}px;
        width:${child.data.width}px;
        height:${child.data.height}px;
        object-fit:${child.data.objectFit || "cover"};
        pointer-events:none;
      ">
      `;
        }
      });

      return html;
    }

    function updateView() {
      const text =
        widget.data.overlayText ||
        widget.data.textTemplate ||
        "Sigan a {user} jugando {game}";

      const strokeSize = widget.data.strokeSize || 2;
      const strokeColor = widget.data.strokeColor || "#000";
      const textPosition = widget.data.textPosition || "top";

      let positionStyle = "";

      if (textPosition === "top") {
        positionStyle = `
  top:20px;
  left:50%;
  transform:translateX(-50%);
  `;
      }

      if (textPosition === "center") {
        positionStyle = `
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  `;
      }

      if (textPosition === "bottom") {
        positionStyle = `
  bottom:20px;
  left:50%;
  transform:translateX(-50%);
  `;
      }
      el.innerHTML = `
  
<div class="clip-area" style="
flex:1;
position:relative;
display:flex;
align-items:center;
justify-content:center;
overflow:hidden;
background:#000;
">

<!-- FAKE CLIP PREVIEW -->
<div style="
position:absolute;
width:80%;
height:70%;
background:linear-gradient(135deg,#111,#222);
border-radius:12px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,0.6);
">

<div style="
position:absolute;
top:8px;
left:8px;
background:rgba(0,0,0,0.7);
color:white;
font-size:11px;
padding:3px 6px;
border-radius:4px;
">
TWITCH CLIP
</div>

<div style="
position:absolute;
bottom:10px;
left:50%;
transform:translateX(-50%);
color:rgba(255,255,255,0.6);
font-size:13px;
">
Preview Clip Area
</div>

</div>

<!-- OVERLAY TEXT -->
<div style="
position:absolute;
${positionStyle}
text-align:${widget.data.textAlign || "center"};
max-width:${widget.data.maxWidth || "80%"};
font-weight:700;
font-size:${widget.data.fontSize || 40}px;
color:${widget.data.textColor || "#fff"};
-webkit-text-stroke:${strokeSize}px ${strokeColor};
background: rgba(${hexToRgb(widget.data.backgroundColor)}, ${widget.data.backgroundOpacity});
padding:6px 12px;
border-radius:${widget.data.borderRadius || 0}px;
pointer-events:none;
">
${parseVariables(text, {
        user: "streamer",
        game: "Minecraft",
        channel: "channel",
        clipTitle: "Epic clutch",
        clipViews: "1200"
      })}
</div>

${getChildrenHTML()}

</div>
`;
    }
    updateView();

    el.updatePreview = updateView;

    return el;
  },

  renderConfig(widget, content, update) {
    content.innerHTML = `
            
            <div class="space-y-6">

                <!-- BASIC SETTINGS -->
                <div class="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-4">

                    <h3 class="text-xs uppercase tracking-wider text-gray-500">
                        Basic
                    </h3>

                    <div>
                        <label class="block text-xs font-medium text-gray-400 mb-2">
                            Command
                        </label>
                        <input id="cfgCommand"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            placeholder-gray-500
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition"
                            value="${widget.data.command || ""}">
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-gray-400 mb-2">
                            Text Template
                        </label>
                        <input id="cfgTemplate"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition"
                            value="${widget.data.textTemplate || ""}">
                    </div>

                </div>

                <!-- DISPLAY SETTINGS -->
                <div class="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-4">

                    <h3 class="text-xs uppercase tracking-wider text-gray-500">
                        Display
                    </h3>

                    <div>
                        <label class="block text-xs font-medium text-gray-400 mb-2">
                            Duration (seconds)
                        </label>
                        <input type="number" id="cfgDuration"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition"
                            value="${widget.data.duration || 10}">
                    </div>

                <!-- ANIMATIONS -->
                <div class="bg-gray-900/40 border border-gray-800 rounded-xl p-4 space-y-4">

                    <h3 class="text-xs uppercase tracking-wider text-gray-500">
                        Animations
                    </h3>

                    <div>
                        <label class="block text-xs font-medium text-gray-400 mb-2">
                            Animation In
                        </label>
                        <select id="cfgAnimIn"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition">
                            <option value="fade">Fade</option>
                            <option value="slide">Slide</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-gray-400 mb-2">
                            Animation Out
                        </label>
                        <select id="cfgAnimOut"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition">
                            <option value="fade">Fade</option>
                            <option value="slide">Slide</option>
                        </select>
                    </div>

                </div>

            </div>
        `;

    // Set current selected values
    document.getElementById("cfgAnimIn").value =
      widget.data.animationIn || "fade";

    document.getElementById("cfgAnimOut").value =
      widget.data.animationOut || "fade";

    // Listeners
    document
      .getElementById("cfgCommand")
      .addEventListener("input", (e) => update({ command: e.target.value }));

    document
      .getElementById("cfgTemplate")
      .addEventListener("input", (e) =>
        update({ textTemplate: e.target.value }),
      );

    document
      .getElementById("cfgDuration")
      .addEventListener("input", (e) =>
        update({ duration: parseInt(e.target.value) }),
      );

    document
      .getElementById("cfgOverlay")
      .addEventListener("input", (e) =>
        update({ overlayText: e.target.value }),
      );

    document
      .getElementById("cfgFontSize")
      .addEventListener("input", (e) =>
        update({ fontSize: parseInt(e.target.value) }),
      );

    // TEXT COLOR SYSTEM
    const colorField = content.querySelector('[data-key="textColor"]');

    if (colorField) {
      const preview = colorField.querySelector(".color-preview");
      const hexInput = colorField.querySelector(".color-hex");

      const nativePicker = colorField.querySelector(".color-native");

      preview.addEventListener("click", () => {
        nativePicker.click();
      });

      nativePicker.value = widget.data.textColor;
      hexInput.value = widget.data.textColor;
      preview.style.background = widget.data.textColor;

      nativePicker.addEventListener("input", (e) => {
        const color = e.target.value;

        preview.style.background = color;
        hexInput.value = color;

        update({
          textColor: color,
        });
      });

      preview.style.background = widget.data.textColor;

      // live update
      hexInput.addEventListener("input", (e) => {
        let color = e.target.value;

        if (!color.startsWith("#")) {
          color = "#" + color;
        }

        if (/^#[0-9A-F]{6}$/i.test(color)) {
          preview.style.background = color;

          update({
            textColor: color,
          });
        }
      });
    }

    document
      .getElementById("cfgBgColor")
      .addEventListener("input", (e) =>
        update({ backgroundColor: e.target.value }),
      );

    document.getElementById("cfgStrokeColor").addEventListener("input", (e) => {
      update({ strokeColor: e.target.value });
    });

    document
      .getElementById("cfgStrokeSize")
      .addEventListener("input", (e) =>
        update({ strokeSize: parseInt(e.target.value) }),
      );

    document
      .getElementById("cfgAnimIn")
      .addEventListener("change", (e) =>
        update({ animationIn: e.target.value }),
      );

    document
      .getElementById("cfgAnimOut")
      .addEventListener("change", (e) =>
        update({ animationOut: e.target.value }),
      );

    document
      .getElementById("cfgTextAlign")
      .addEventListener("change", (e) => update({ textAlign: e.target.value }));

    document
      .getElementById("cfgTextPosition")
      .addEventListener("change", (e) =>
        update({ textPosition: e.target.value }),
      );
  },
};

registerWidget(window.ShoutoutWidget);