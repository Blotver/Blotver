window.ImageWidget = {
    type: "image",

    defaultData: {
        x: 100,
        y: 100,
        width: 300,
        height: 300,
        url: "",
        visible: true,

        objectFit: "cover",   // cover | contain
        borderRadius: 0,
        shadow: 0,
        opacity: 1,
        lockRatio: false,
        aspectRatio: 1
    },

    renderCanvas(widget) {

        const wrapper = document.createElement("div");
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.position = "relative";

        const img = document.createElement("img");

        if (widget.data.url) {
            img.src = widget.data.url;
        } else {
            wrapper.style.background = "#1f293700";
            wrapper.style.border = "2px dashed #37415100";
        }

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = widget.data.objectFit || "cover";
        img.style.borderRadius = (widget.data.borderRadius || 0) + "px";
        img.style.opacity = widget.data.opacity ?? 1;
        img.style.boxShadow = widget.data.shadow
            ? `0 10px 30px rgba(0,0,0,${widget.data.shadow / 100})`
            : "none";

        img.draggable = false;

        // 🔥 Capturar proporción real cuando carga
        img.onload = () => {
            if (!widget.data.aspectRatio && img.naturalWidth) {
                widget.data.aspectRatio =
                    img.naturalWidth / img.naturalHeight;
            }
        };

        wrapper.appendChild(img);
        return wrapper;
    },

    renderConfig(widget, container, updateSelectedWidget) {

        container.innerHTML = `
    <div class="space-y-6 text-sm">

        <!-- IMAGE -->
        <div>
            <label class="text-xs uppercase text-gray-400 tracking-wider">
                Image
            </label>

            <div class="mt-2 relative group cursor-pointer" id="changeImage">
                ${widget.data.url
                ? `<img src="${widget.data.url}" 
                            class="rounded-lg w-full h-32 object-cover border border-gray-700"/>`
                : `<div class="h-32 flex items-center justify-center 
                            border border-dashed border-gray-600 
                            rounded-lg text-gray-500 text-sm">
                            No image selected
                       </div>`
            }
                <div class="absolute inset-0 bg-black/60 opacity-0 
                            group-hover:opacity-100
                            flex items-center justify-center
                            text-white text-sm rounded-lg transition">
                    Change Image
                </div>
            </div>
        </div>

        <!-- SIZE -->
        <div>
            <label class="text-xs uppercase text-gray-400 tracking-wider">
                Size
            </label>

            <div class="flex items-center gap-2 mt-2">
                <input type="number" value="${widget.data.width}"
                    data-field="width"
                    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-full"/>

                <input type="number" value="${widget.data.height}"
                    data-field="height"
                    class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 w-full"/>

                <button id="lockRatio"
                    class="px-3 py-2 rounded-lg border 
                    ${widget.data.lockRatio ? "bg-purple-600 border-purple-600" : "bg-gray-800 border-gray-700"}">
                    🔒
                </button>
            </div>
        </div>

        <!-- FIT MODE -->
        <div>
            <label class="text-xs uppercase text-gray-400 tracking-wider">
                Fit Mode
            </label>

            <div class="flex gap-2 mt-2">
                <button data-fit="cover"
                    class="flex-1 py-2 rounded-lg border
                    ${widget.data.objectFit === "cover" ? "bg-purple-600 border-purple-600" : "bg-gray-800 border-gray-700"}">
                    Cover
                </button>

                <button data-fit="contain"
                    class="flex-1 py-2 rounded-lg border
                    ${widget.data.objectFit === "contain" ? "bg-purple-600 border-purple-600" : "bg-gray-800 border-gray-700"}">
                    Contain
                </button>
            </div>
        </div>

        <!-- BORDER RADIUS -->
        <div>
            <label class="text-xs uppercase text-gray-400 tracking-wider">
                Border Radius
            </label>
            <input type="range" min="0" max="100"
                value="${widget.data.borderRadius || 0}"
                data-field="borderRadius"
                class="w-full mt-2"/>
        </div>

        <!-- SHADOW -->
        <div>
            <label class="text-xs uppercase text-gray-400 tracking-wider">
                Shadow
            </label>
            <input type="range" min="0" max="100"
                value="${widget.data.shadow || 0}"
                data-field="shadow"
                class="w-full mt-2"/>
        </div>

        <!-- OPACITY -->
        <div>
            <label class="text-xs uppercase text-gray-400 tracking-wider">
                Opacity
            </label>
            <input type="range" min="0" max="1" step="0.01"
                value="${widget.data.opacity ?? 1}"
                data-field="opacity"
                class="w-full mt-2"/>
        </div>

    </div>
    `;

        container.querySelector("#changeImage")
            ?.addEventListener("click", openImageModal);

        container.querySelectorAll("input[data-field]")
            .forEach(input => {
                input.addEventListener("input", (e) => {

                    const field = e.target.dataset.field;
                    let value = e.target.type === "range"
                        ? parseFloat(e.target.value)
                        : parseInt(e.target.value);

                    // 🔒 Lock aspect ratio
                    if (widget.data.lockRatio && field === "width") {
                        updateSelectedWidget({
                            width: value,
                            height: value / widget.data.aspectRatio
                        });
                    } else if (widget.data.lockRatio && field === "height") {
                        updateSelectedWidget({
                            height: value,
                            width: value * widget.data.aspectRatio
                        });
                    } else {
                        updateSelectedWidget({ [field]: value });
                    }
                });
            });

        container.querySelectorAll("[data-fit]")
            .forEach(btn => {
                btn.addEventListener("click", () => {
                    updateSelectedWidget({
                        objectFit: btn.dataset.fit
                    });
                    openConfig(widget);
                });
            });

        container.querySelector("#lockRatio")
            ?.addEventListener("click", () => {
                updateSelectedWidget({
                    lockRatio: !widget.data.lockRatio
                });
                openConfig(widget);
            });
    }
};

registerWidget(window.ImageWidget);