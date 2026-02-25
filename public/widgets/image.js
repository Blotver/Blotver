window.ImageWidget = {
    type: "image",

    defaultData: {
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        url: "",
        visible: true
    },

    renderCanvas(widget) {
        const wrapper = document.createElement("div");

        const img = document.createElement("img");

        if (widget.data.url) {
            img.src = widget.data.url;
        } else {
            img.src = "https://via.placeholder.com/300x300?text=No+Image";
        }

        img.style.width = (widget.data.width || 300) + "px";
        img.style.height = (widget.data.height || 300) + "px";
        img.draggable = false;

        wrapper.appendChild(img);

        return wrapper;
    },

    renderConfig(widget, container, updateSelectedWidget) {

        const btn = document.createElement("button");
        btn.innerText = "Set Image";
        btn.className = "bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-sm w-full";
        btn.onclick = openImageModal;

        container.appendChild(btn);

    }
};

registerWidget(window.ImageWidget);