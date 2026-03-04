window.ShoutoutWidget = {
  type: "shoutout",

  defaultData: {
    x: 100,
    y: 100,
    command: "!so",
    textTemplate: "Sigan a {user} jugando {game}",
    duration: 10000,
    overlayText: "",
    animationIn: "fade",
    animationOut: "fade",

    // NUEVO
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
    el.style.background = "transparent";
    el.style.borderRadius = "12px";
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

      const style = `
    padding:12px;
    font-weight:700;
    font-size:${widget.data.fontSize || 40}px;
    text-align:center;
    color:${widget.data.textColor || "#ffffff"};
    background:${widget.data.backgroundColor || "rgba(0,0,0,0.4)"};
    border-radius:${widget.data.borderRadius || 12}px;
    text-shadow:
        ${strokeSize}px ${strokeSize}px 0 ${strokeColor},
        -${strokeSize}px -${strokeSize}px 0 ${strokeColor},
        ${strokeSize}px -${strokeSize}px 0 ${strokeColor},
        -${strokeSize}px ${strokeSize}px 0 ${strokeColor};
`;

      el.innerHTML = `
  <div style="
      flex:0 0 auto;
      padding:8px 12px;
      font-weight:700;
      font-size:${widget.data.fontSize || 28}px;
      text-align:center;
      color:${widget.data.textColor || "#ffffff"};
      background:${widget.data.backgroundColor || "rgba(0,0,0,0.4)"};
      text-shadow:
          ${strokeSize}px ${strokeSize}px 0 ${strokeColor},
          -${strokeSize}px -${strokeSize}px 0 ${strokeColor},
          ${strokeSize}px -${strokeSize}px 0 ${strokeColor},
          -${strokeSize}px ${strokeSize}px 0 ${strokeColor};
  ">
      ${parseVariables(text)}
  </div>

  <div style="
      flex:1;
      display:flex;
      align-items:center;
      justify-content:center;
      border-top:1px solid rgba(255,255,255,0.05);
      background:
          repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.05),
              rgba(255,255,255,0.05) 10px,
              transparent 10px,
              transparent 20px
          );
      font-size:14px;
      color:rgba(255,255,255,0.6);
  ">
      CLIP PREVIEW AREA
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
                            Duration (ms)
                        </label>
                        <input type="number" id="cfgDuration"
                            class="w-full bg-gray-900 border border-gray-700
                            rounded-lg px-3 py-2.5 text-sm text-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-purple-500/50 focus:border-purple-500
                            transition"
                            value="${widget.data.duration || 10000}">
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
  },
};

registerWidget(window.ShoutoutWidget);
