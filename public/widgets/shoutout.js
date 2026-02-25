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
            <div>
                <label class="block mb-1 text-sm text-gray-400">Command</label>
                <input id="cfgCommand"
                    class="w-full mb-4 p-2 bg-gray-800 rounded"
                    value="${widget.data.command || ""}">
            </div>

            <div>
                <label class="block mb-1 text-sm text-gray-400">Text Template</label>
                <input id="cfgTemplate"
                    class="w-full mb-4 p-2 bg-gray-800 rounded"
                    value="${widget.data.textTemplate || ""}">
            </div>

            <div>
                <label class="block mb-1 text-sm text-gray-400">Duration (ms)</label>
                <input type="number" id="cfgDuration"
                    class="w-full mb-4 p-2 bg-gray-800 rounded"
                    value="${widget.data.duration || 10000}">
            </div>

            <div>
                <label class="block mb-1 text-sm text-gray-400">Overlay Text</label>
                <input id="cfgOverlay"
                    class="w-full mb-4 p-2 bg-gray-800 rounded"
                    value="${widget.data.overlayText || ""}">
            </div>

            <div>
                <label class="block mb-1 text-sm text-gray-400">Animation In</label>
                <select id="cfgAnimIn"
                    class="w-full mb-4 p-2 bg-gray-800 rounded">
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                </select>
            </div>

            <div>
                <label class="block mb-1 text-sm text-gray-400">Animation Out</label>
                <select id="cfgAnimOut"
                    class="w-full mb-4 p-2 bg-gray-800 rounded">
                    <option value="fade">Fade</option>
                    <option value="slide">Slide</option>
                </select>
            </div>
        `;

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