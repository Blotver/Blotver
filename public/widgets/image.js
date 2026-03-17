// public/widgets/image.js

window.ImageWidget = {

    type: "image",

    defaultData: {

        x: 0.2,
        y: 0.2,
        width: 0.15,
        height: 0.15,

        url: "",
        visible: true,

        objectFit: "cover",
        borderRadius: 0,
        shadow: 0,
        opacity: 1,

        lockRatio: false,
        aspectRatio: null

    },

    /* ============================= */
    /* APPLY STYLES (GLOBAL) */
    /* ============================= */

    applyStyles(widget) {

        StyleEngine.applyImage(widget._img, widget.data)

    },

    /* ============================= */
    /* CANVAS RENDER */
    /* ============================= */

    renderCanvas(widget) {

        const d = widget.data

        const wrapper = document.createElement("div")
        wrapper.style.width = "100%"
        wrapper.style.height = "100%"

        const img = document.createElement("img")

        widget._img = img

        img.style.width = "100%"
        img.style.height = "100%"
        img.draggable = false

        if (d.url)
            img.src = d.url

        img.onload = () => {

            if (img.naturalWidth) {

                widget.data.aspectRatio =
                    img.naturalWidth / img.naturalHeight

            }

        }

        wrapper.appendChild(img)

        this.applyStyles(widget)

        return wrapper

    },

    /* ============================= */
    /* CONFIG PANEL */
    /* ============================= */

    renderConfig(widget, container, update) {

        const d = widget.data

        container.innerHTML = `

<div class="config-root">

<!-- IMAGE -->
<div class="config-card">

<div class="config-title">
Image
</div>

<div id="changeImage" class="cursor-pointer">

${d.url
                ? `<img src="${d.url}" class="config-image-preview"/>`
                : `<div class="config-image-placeholder">No image</div>`
            }

</div>

</div>


<!-- SIZE -->
<div class="config-card">

<div class="config-title">
Size
</div>

<div class="config-row">

<div class="config-size-grid">

<input
type="number"
data-field="width"
value="${Math.round(d.width * 100)}"
class="config-input"
/>

<input
type="number"
data-field="height"
value="${Math.round(d.height * 100)}"
class="config-input"
/>

<button id="lockRatio"
class="ratio-btn ${d.lockRatio ? "active" : ""}">
${d.lockRatio ? "Locked" : "Free"}
</button>

</div>

</div>

</div>


<!-- FIT -->
<div class="config-card">

<div class="config-title">
Fit Mode
</div>

<div class="mode-switch">

<button data-fit="cover"
class="mode-btn ${d.objectFit === "cover" ? "active" : ""}">
Cover
</button>

<button data-fit="contain"
class="mode-btn ${d.objectFit === "contain" ? "active" : ""}">
Contain
</button>

</div>

</div>


<!-- BORDER -->
<div class="config-card">

<div class="config-title">
Border Radius
</div>

<div class="config-row">

<input
type="range"
min="0"
max="100"
data-field="borderRadius"
value="${d.borderRadius}"
class="config-slider"
/>

</div>

</div>


<!-- SHADOW -->
<div class="config-card">

<div class="config-title">
Shadow
</div>

<div class="config-row">

<input
type="range"
min="0"
max="100"
data-field="shadow"
value="${d.shadow}"
class="config-slider"
/>

</div>

</div>


<!-- OPACITY -->
<div class="config-card">

<div class="config-title">
Opacity
</div>

<div class="config-row">

<input
type="range"
min="0"
max="1"
step="0.01"
data-field="opacity"
value="${d.opacity}"
class="config-slider"
/>

</div>

</div>

</div>
`

        /* ============================= */
        /* IMAGE MODAL */
        /* ============================= */

        container
            .querySelector("#changeImage")
            ?.addEventListener("click", openImageModal)


        /* ============================= */
        /* INPUT HANDLERS */
        /* ============================= */

        container
            .querySelectorAll("[data-field]")
            .forEach(input => {

                input.addEventListener("input", e => {

                    const field = e.target.dataset.field

                    let value

                    if (input.type === "range")
                        value = parseFloat(e.target.value)
                    else
                        value = (parseFloat(e.target.value) || 0) / 100


                    /* LOCK RATIO */

                    if (
                        d.lockRatio &&
                        d.aspectRatio &&
                        field === "width"
                    ) {

                        update({
                            width: value,
                            height: value / d.aspectRatio
                        })

                    }

                    else if (
                        d.lockRatio &&
                        d.aspectRatio &&
                        field === "height"
                    ) {

                        update({
                            height: value,
                            width: value * d.aspectRatio
                        })

                    }

                    else {

                        update({ [field]: value })

                    }

                    window.ImageWidget.applyStyles(widget)

                })

            })


        /* ============================= */
        /* FIT BUTTONS */
        /* ============================= */

        container
            .querySelectorAll("[data-fit]")
            .forEach(btn => {

                btn.addEventListener("click", () => {

                    const fit = btn.dataset.fit

                    container
                        .querySelectorAll("[data-fit]")
                        .forEach(b => b.classList.remove("active"))

                    btn.classList.add("active")

                    update({
                        objectFit: fit
                    })

                    window.ImageWidget.applyStyles(widget)

                })

            })


        /* ============================= */
        /* RATIO LOCK */
        /* ============================= */

        container
            .querySelector("#lockRatio")
            ?.addEventListener("click", () => {

                update({
                    lockRatio: !d.lockRatio
                })

            })

    }

}

registerWidget(window.ImageWidget)