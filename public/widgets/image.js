// public/widgets/image.js

window.ImageWidget = {

    type: "image",

    defaultData: {
        x: 0.2,
        y: 0.2,
        width: 0.30,
        height: 0.30,

        url: "",
        visible: true,

        objectFit: "cover",
        borderRadius: 0,
        shadow: 0,
        opacity: 1,
    },

    /* ============================= */
    /* APPLY STYLES */
    /* ============================= */

    applyStyles(widget) {
        if (!widget._img) return;
        StyleEngine.applyImage(widget._img, widget.data);
    },

    /* ============================= */
    /* RENDER */
    /* ============================= */

    render({ widget, context }) {

        const d = widget.data;

        const el = document.createElement("div");

        el.dataset.widgetId = widget._id;

        el.style.position = "absolute";
        el.style.userSelect = "none";
        el.style.cursor = context.mode === "editor" ? "move" : "default";

        const parentW = context.mode === "overlay"
            ? context.screenW
            : context.canvas.clientWidth;

        const parentH = context.mode === "overlay"
            ? context.screenH
            : context.canvas.clientHeight;

        const left = d.x * parentW;
        const top = d.y * parentH;
        const width = d.width * parentW;
        const height = d.height * parentH;

        el.style.left = left + "px";
        el.style.top = top + "px";
        el.style.width = width + "px";
        el.style.height = height + "px";

        // =============================
        // IMAGE
        // =============================

        const img = StyleEngine.createImage(d);

        img.style.pointerEvents = "none";

        // 🔥 fallback visual si no hay imagen
        if (!d.url) {
            img.style.background = "linear-gradient(135deg,#1f2937,#111827)";
            img.style.display = "flex";
            img.style.alignItems = "center";
            img.style.justifyContent = "center";
            img.innerHTML = `<span style="
        color:#9ca3af;
        font-size:12px;
        font-family:sans-serif;
      ">No image</span>`;
        }

        widget._img = img;

        el.appendChild(img);

        // =============================
        // 🔥 RESIZE HANDLES (EDITOR)
        // =============================
        if (context.mode === "editor") {

            const positions = [
                "top", "bottom", "left", "right",
                "tl", "tr", "bl", "br"
            ];

            positions.forEach(pos => {
                const handle = document.createElement("div");

                handle.className = `resize-handle ${pos}`;

                handle.style.position = "absolute";
                handle.style.width = "10px";
                handle.style.height = "10px";
                handle.style.background = "#8b5cf6";
                handle.style.borderRadius = "50%";
                handle.style.zIndex = "10";

                // POSICIÓN
                if (pos === "top") {
                    handle.style.top = "-5px";
                    handle.style.left = "50%";
                    handle.style.transform = "translateX(-50%)";
                }

                if (pos === "bottom") {
                    handle.style.bottom = "-5px";
                    handle.style.left = "50%";
                    handle.style.transform = "translateX(-50%)";
                }

                if (pos === "left") {
                    handle.style.left = "-5px";
                    handle.style.top = "50%";
                    handle.style.transform = "translateY(-50%)";
                }

                if (pos === "right") {
                    handle.style.right = "-5px";
                    handle.style.top = "50%";
                    handle.style.transform = "translateY(-50%)";
                }

                if (pos === "tl") {
                    handle.style.left = "-5px";
                    handle.style.top = "-5px";
                }

                if (pos === "tr") {
                    handle.style.right = "-5px";
                    handle.style.top = "-5px";
                }

                if (pos === "bl") {
                    handle.style.left = "-5px";
                    handle.style.bottom = "-5px";
                }

                if (pos === "br") {
                    handle.style.right = "-5px";
                    handle.style.bottom = "-5px";
                }

                el.appendChild(handle);
            });
        }

        return el;
    },

    /* ============================= */
    /* CONFIG PANEL */
    /* ============================= */

    renderConfig(widget, container, update) {

        const d = widget.data;

        container.innerHTML = `
<div class="config-root">

  <!-- IMAGE -->
  <div class="config-card">
    <div class="config-title">Image</div>

    <div id="changeImage" class="cursor-pointer config-image-box">
      ${d.url
                ? `<img src="${d.url}" class="config-image-preview"/>`
                : `<div class="config-image-placeholder">Select image</div>`
            }
    </div>
  </div>

  <!-- SIZE -->
  <div class="config-card">
    <div class="config-title">Size (%)</div>

    <div class="config-size-grid">
      <input type="number" data-field="width" value="${Math.round(d.width * 100)}" class="config-input"/>
      <input type="number" data-field="height" value="${Math.round(d.height * 100)}" class="config-input"/>
    </div>
  </div>

  <!-- FIT -->
  <div class="config-card">
    <div class="config-title">Fit Mode</div>

    <div class="mode-switch">
      <button data-fit="cover" class="mode-btn ${d.objectFit === "cover" ? "active" : ""}">Cover</button>
      <button data-fit="contain" class="mode-btn ${d.objectFit === "contain" ? "active" : ""}">Contain</button>
    </div>
  </div>

  <!-- BORDER -->
  <div class="config-card">
    <div class="config-title">Border Radius</div>
    <input type="range" min="0" max="100" data-field="borderRadius" value="${d.borderRadius}" class="config-slider"/>
  </div>

  <!-- SHADOW -->
  <div class="config-card">
    <div class="config-title">Shadow</div>
    <input type="range" min="0" max="100" data-field="shadow" value="${d.shadow}" class="config-slider"/>
  </div>

  <!-- OPACITY -->
  <div class="config-card">
    <div class="config-title">Opacity</div>
    <input type="range" min="0" max="1" step="0.01" data-field="opacity" value="${d.opacity}" class="config-slider"/>
  </div>

</div>
`;

        /* ============================= */
        /* IMAGE PICKER */
        /* ============================= */

        container.querySelector("#changeImage")?.addEventListener("click", () => {
            openImageModal((url) => {
                update({ url });
            });
        });

        /* ============================= */
        /* INPUTS */
        /* ============================= */

        container.querySelectorAll("[data-field]").forEach(input => {

            input.addEventListener("input", (e) => {

                const field = e.target.dataset.field;
                let value;

                if (input.type === "range") {
                    value = parseFloat(e.target.value);
                } else {
                    value = (parseFloat(e.target.value) || 0) / 100;
                }

                // 🔥 clamp básico (evita bugs locos)
                if (field === "width" || field === "height") {
                    value = Math.max(0.01, Math.min(1, value));
                }

                if (field === "opacity") {
                    value = Math.max(0, Math.min(1, value));
                }

                update({ [field]: value });

            });

        });

        /* ============================= */
        /* FIT BUTTONS */
        /* ============================= */

        container.querySelectorAll("[data-fit]").forEach(btn => {

            btn.addEventListener("click", () => {

                const fit = btn.dataset.fit;

                container.querySelectorAll("[data-fit]")
                    .forEach(b => b.classList.remove("active"));

                btn.classList.add("active");

                update({ objectFit: fit });

            });

        });

    }

};

registerWidget(window.ImageWidget);