window.ShoutoutWidget = {
    type: "shoutout",

    defaultData: {
        x: 100,
        y: 100,
        command: "!so",
        textTemplate: "Sigan a {user}",
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
            <label class="block mb-2 text-sm">Command</label>
            <input id="cfgCommand"
                class="w-full mb-4 p-2 bg-gray-800 rounded"
                value="${widget.data.command}">
        `;

        document.getElementById("cfgCommand")
            .addEventListener("input", e =>
                update({ command: e.target.value })
            );
    }
};
registerWidget(window.ShoutoutWidget);