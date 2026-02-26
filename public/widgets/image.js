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

        // 🔥 NO le ponemos tamaño acá
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";

        const img = document.createElement("img");

        if (widget.data.url) {
            img.src = widget.data.url;
        } else {
            wrapper.style.background = "#1f293700";
            wrapper.style.border = "2px dashed #374151";
        }

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.draggable = false;

        wrapper.appendChild(img);

        return wrapper;
    },

    renderConfig(widget, container, updateSelectedWidget) {

        container.innerHTML = `
        <div class="space-y-5">

            <!-- IMAGE PREVIEW -->
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

            <!-- SIZE CONTROLS -->
            <div>
                <label class="text-xs uppercase text-gray-400 tracking-wider">
                    Size
                </label>

                <div class="grid grid-cols-2 gap-3 mt-2">
                    <input type="number" 
                           value="${widget.data.width}"
                           data-field="width"
                           class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"/>

                    <input type="number" 
                           value="${widget.data.height}"
                           data-field="height"
                           class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"/>
                </div>
            </div>

        </div>
    `;

        // 👉 Abrir modal al hacer click en preview
        container.querySelector("#changeImage").onclick = openImageModal;

        // 👉 Manejar cambios de tamaño
        container.querySelectorAll("input[data-field]").forEach(input => {
            input.addEventListener("input", (e) => {
                const field = e.target.dataset.field;
                const value = parseInt(e.target.value);

                updateSelectedWidget({
                    [field]: value
                });
            });
        });

    }
};

registerWidget(window.ImageWidget);