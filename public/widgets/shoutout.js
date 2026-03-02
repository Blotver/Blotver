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
        animationOut: "fade"
    },

    renderCanvas(widget) {
        const el = document.createElement("div");
        el.innerText = "🎬 ShoutOut Widget";
        el.style.border = "2px solid purple";
        el.style.padding = "8px 12px";
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
        document.getElementById("cfgCommand")
            .addEventListener("input", e =>
                update({ command: e.target.value })
            );

        document.getElementById("cfgTemplate")
            .addEventListener("input", e =>
                update({ textTemplate: e.target.value })
            );

        document.getElementById("cfgDuration")
            .addEventListener("input", e =>
                update({ duration: parseInt(e.target.value) })
            );

        document.getElementById("cfgOverlay")
            .addEventListener("input", e =>
                update({ overlayText: e.target.value })
            );

        document.getElementById("cfgAnimIn")
            .addEventListener("change", e =>
                update({ animationIn: e.target.value })
            );

        document.getElementById("cfgAnimOut")
            .addEventListener("change", e =>
                update({ animationOut: e.target.value })
            );
    }
};

registerWidget(window.ShoutoutWidget);