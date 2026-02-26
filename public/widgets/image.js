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
        aspectRatio: null
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
            if (img.naturalWidth) {
                widget.data.aspectRatio =
                    img.naturalWidth / img.naturalHeight;
            }
        };

        wrapper.appendChild(img);
        return wrapper;
    },

    renderConfig(widget, container, updateSelectedWidget) {

        container.innerHTML = `
<div class="space-y-6 text-sm text-gray-300">

    <!-- IMAGE -->
    <div>
        <label class="text-xs uppercase text-gray-500 tracking-wider">
            Image
        </label>

        <div class="mt-2 relative group cursor-pointer" id="changeImage">
            ${widget.data.url
                ? `<img src="${widget.data.url}" 
                   class="rounded-md w-full h-28 object-cover border border-gray-700"/>`
                : `<div class="h-28 flex items-center justify-center 
                      border border-dashed border-gray-700
                      rounded-md text-gray-500 text-xs">
                      No image
                 </div>`
            }

            <div class="absolute inset-0 bg-black/50 opacity-0 
                        group-hover:opacity-100
                        flex items-center justify-center
                        text-white text-xs rounded-md transition">
                Change
            </div>
        </div>
    </div>

    <!-- SIZE -->
    <div>
        <label class="text-xs uppercase text-gray-500 tracking-wider">
            Size
        </label>

        <div class="flex items-center gap-2 mt-2">

            <input type="number" value="${widget.data.width}"
                data-field="width"
                class="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-gray-500"/>

            <input type="number" value="${widget.data.height}"
                data-field="height"
                class="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:border-gray-500"/>

            <button id="lockRatio"
                class="flex items-center justify-center w-10 h-10 transition-colors duration-150 rounded-md border
                ${widget.data.lockRatio
                ? "bg-gray-600 border-gray-500 text-white"
                : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}">

                ${widget.data.lockRatio
                ? `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
     class="w-4 h-4">
  <path d="M6 10V7a6 6 0 0 1 12 0v3"/>
  <rect x="4" y="10" width="16" height="10" rx="2"/>
</svg>
                `
                : `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
     class="w-4 h-4">
  <path d="M6 10V7a6 6 0 0 1 11 0"/>
  <rect x="4" y="10" width="16" height="10" rx="2"/>
</svg>
                `
            }

            </button>
        </div>
    </div>

    <!-- FIT MODE -->
    <div>
        <label class="text-xs uppercase text-gray-500 tracking-wider">
            Fit Mode
        </label>

        <div class="flex gap-2 mt-2">

            ${["cover", "contain"].map(mode => `
                <button data-fit="${mode}"
                    class="flex-1 py-2 rounded-md border text-xs capitalize
                    ${widget.data.objectFit === mode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"}">
                    ${mode}
                </button>
            `).join("")}

        </div>
    </div>

    <!-- BORDER RADIUS -->
    <div>
        <label class="text-xs uppercase text-gray-500 tracking-wider">
            Border Radius
        </label>

        <div class="flex items-center gap-3 mt-2">
            <input type="range" min="0" max="100"
                value="${widget.data.borderRadius || 0}"
                data-field="borderRadius"
                class="w-full accent-gray-500"/>
            <span class="text-xs text-gray-400 w-10 text-right">
                ${widget.data.borderRadius || 0}
            </span>
        </div>
    </div>

    <!-- SHADOW -->
    <div>
        <label class="text-xs uppercase text-gray-500 tracking-wider">
            Shadow
        </label>

        <div class="flex items-center gap-3 mt-2">
            <input type="range" min="0" max="100"
                value="${widget.data.shadow || 0}"
                data-field="shadow"
                class="w-full accent-gray-500"/>
            <span class="text-xs text-gray-400 w-10 text-right">
                ${widget.data.shadow || 0}
            </span>
        </div>
    </div>

    <!-- OPACITY -->
    <div>
        <label class="text-xs uppercase text-gray-500 tracking-wider">
            Opacity
        </label>

        <div class="flex items-center gap-3 mt-2">
            <input type="range" min="0" max="1" step="0.01"
                value="${widget.data.opacity ?? 1}"
                data-field="opacity"
                class="w-full accent-gray-500"/>
            <span class="text-xs text-gray-400 w-10 text-right">
                ${widget.data.opacity ?? 1}
            </span>
        </div>
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
                });
            });

        container.querySelector("#lockRatio")
            ?.addEventListener("click", () => {
                updateSelectedWidget({
                    lockRatio: !widget.data.lockRatio
                });
            });
    }
};

registerWidget(window.ImageWidget);