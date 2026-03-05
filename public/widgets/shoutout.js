window.ShoutoutWidget = {
  type: "shoutout",

  defaultData: {
    x: 100,
    y: 100,
    command: "!so",
    textTemplate: "Sigan a {user} jugando {game}",

    imageWidgetId: null,

    duration: 30,
    overlayText: "",
    animationIn: "fade",
    animationOut: "fade",

    imgX: 20,
    imgY: 60,

    fontSize: 40,
    textColor: "#ffffff",
    strokeColor: "#000000",
    strokeSize: 2,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
  },

  renderCanvas(widget) {
    const el = document.createElement("div");

    el.style.width = "100%";
    el.style.height = "100%";
    el.style.display = "flex";
    el.style.flexDirection = "column";
    el.style.background = "#0f0f0f";
    el.style.borderRadius = widget.data.borderRadius + "px";
    el.style.border = "1px solid rgba(255,255,255,0.06)";
    el.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
    el.style.overflow = "hidden";

    function parseVariables(text) {
      return text
        .replaceAll("{user}", "StreamerX")
        .replaceAll("{game}", "Just Chatting");
    }

    function updateView() {
      const text =
        widget.data.overlayText ||
        widget.data.textTemplate ||
        "Sigan a {user} jugando {game}";

      const strokeSize = widget.data.strokeSize || 2;
      const strokeColor = widget.data.strokeColor || "#000";

      let imageHTML = "";

      if (widget.data.imageWidgetId) {
        const imgWidget = (window.widgets || []).find(
          (w) => w._id === widget.data.imageWidgetId,
        );

        if (imgWidget?.data?.url) {
          imageHTML = `
<img src="${imgWidget.data.url}"
class="clip-image"
style="
position:absolute;
left:${widget.data.imgX || 20}px;
top:${widget.data.imgY || 60}px;
width:120px;
pointer-events:auto;
">
`;
        }
      } else if (widget.data.imageUrl) {
        imageHTML = `
<img src="${widget.data.imageUrl}"
class="clip-image"
style="
position:absolute;
left:${widget.data.imgX || 20}px;
top:${widget.data.imgY || 60}px;
width:120px;
pointer-events:auto;
">
`;
      }

      el.innerHTML = `
<div style="
flex:0 0 auto;
padding:8px 12px;
font-weight:700;
font-size:${widget.data.fontSize || 28}px;
text-align:center;
color:${widget.data.textColor || "#ffffff"};
background:${widget.data.backgroundColor || "rgba(0,0,0,0.4)"};
">
${parseVariables(text)}
</div>

<div class="clip-area" style="
flex:1;
position:relative;
display:flex;
align-items:center;
justify-content:center;
overflow:hidden;
">

<div style="
font-size:14px;
color:rgba(255,255,255,0.6);
">
CLIP PREVIEW AREA
</div>

${imageHTML}

</div>
`;
    }

    updateView();
    requestAnimationFrame(() => {
      const img = el.querySelector(".clip-image");
      if (!img) return;

      let dragging = false;
      let startX, startY;

      img.onmousedown = null;

      img.addEventListener("mousedown", (e) => {
        e.preventDefault();
        dragging = true;
        startX = e.clientX - (widget.data.imgX || 0);
        startY = e.clientY - (widget.data.imgY || 0);
      });

      document.onmousemove = (e) => {
        if (!dragging) return;

        const x = e.clientX - startX;
        const y = e.clientY - startY;

        img.style.left = x + "px";
        img.style.top = y + "px";

        widget.data.imgX = x;
        widget.data.imgY = y;
      };

      document.onmouseup = () => {
        dragging = false;
      };
    });
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
Decoration Image
</label>

<select id="cfgImageWidget"
class="w-full bg-gray-900 border border-gray-700
rounded-lg px-3 py-2.5 text-sm text-gray-200">
<option value="">None</option>
</select>
</div>
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

                    <div>
                        <label class="block text-xs font-medium text-gray-400 mb-2">
                            Overlay Text
                        </label>
                        <div>
        <label class="block text-xs font-medium text-gray-400 mb-2">
            Font Size
        </label>
        <input type="number" id="cfgFontSize"
            class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200"
            value="${widget.data.fontSize || 40}">
    </div>

    <div>
        <label class="block text-xs font-medium text-gray-400 mb-2">
            Text Color
        </label>
        <input type="color" id="cfgTextColor"
            value="${widget.data.textColor || "#ffffff"}">
    </div>

    <div>
        <label class="block text-xs font-medium text-gray-400 mb-2">
            Stroke Color
        </label>
        <input type="color" id="cfgStrokeColor"
            value="${widget.data.strokeColor || "#000000"}">
    </div>

    <div>
        <label class="block text-xs font-medium text-gray-400 mb-2">
            Stroke Size
        </label>
        <input type="number" id="cfgStrokeSize"
            value="${widget.data.strokeSize || 2}">
    </div>

    <div>
        <label class="block text-xs font-medium text-gray-400 mb-2">
            Background Color
        </label>
        <input type="color" id="cfgBgColor"
    value="${widget.data.backgroundColor || "#000000"}">
    </div>
                        <input id="cfgOverlay"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition"
                            value="${widget.data.overlayText || ""}">
                    </div>

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

    document
      .getElementById("cfgTextColor")
      .addEventListener("input", (e) => update({ textColor: e.target.value }));

    document
      .getElementById("cfgBgColor")
      .addEventListener("input", (e) =>
        update({ backgroundColor: e.target.value }),
      );

    document
      .getElementById("cfgStrokeColor")
      .addEventListener("input", (e) =>
        update({ strokeColor: e.target.value }),
      );

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

    const select = document.getElementById("cfgImageWidget");

    const imageWidgets = (window.widgets || []).filter(
      (w) => w.type === "image",
    );

    imageWidgets.forEach((img) => {
      const opt = document.createElement("option");

      opt.value = img._id;
      opt.textContent = "Image " + img._id.slice(-4);

      if (widget.data.imageWidgetId === img._id) {
        opt.selected = true;
      }

      select.appendChild(opt);
    });

    select.addEventListener("change", (e) => {
      update({
        imageWidgetId: e.target.value || null,
      });
    });
  },
};

registerWidget(window.ShoutoutWidget);
