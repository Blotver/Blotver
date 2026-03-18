//blotver\public\js\editor\editorLayers.js

window.EditorLayers = {

  render({ widgets, onSelect, onToggleVisibility, onRename, onReorder }) {

    const panel = document.getElementById("layersPanel")
    if (!panel) return

    panel.innerHTML = ""

    let dragId = null

    function createItem(widget, level = 0) {

      const isHidden = widget.data.visible === false

      const item = document.createElement("div")
      item.className = "layer-item"
      item.draggable = true
      item.dataset.id = widget._id
      item.style.marginLeft = (level * 14) + "px"

      // =========================
      // DRAG EVENTS 🔥
      // =========================
      item.ondragstart = () => {
        dragId = widget._id
        item.style.opacity = "0.4"
      }

      item.ondragover = (e) => {
        e.preventDefault()
        item.classList.add("drag-over")
      }

      item.ondragleave = () => {
        item.classList.remove("drag-over")
      }

      item.ondrop = () => {
        item.classList.remove("drag-over")

        item.style.opacity = "1"

        if (dragId && dragId !== widget._id) {
          if (onReorder) onReorder(dragId, widget._id)
        }
      }

      // =========================
      // LEFT
      // =========================
      const left = document.createElement("div")
      left.className = "layer-left"

      // FIX SVG CLICK ❗
      const eye = document.createElement("button")
      eye.className = "layer-eye"
      eye.innerHTML = isHidden ? "🙈" : "👁"

      eye.onclick = (e) => {
        e.stopPropagation()

        widget.data.visible = !widget.data.visible
        eye.innerHTML = widget.data.visible ? "👁" : "🙈"

        if (onToggleVisibility) onToggleVisibility(widget)
      }

      const name = document.createElement("input")
      name.value = widget.name || widget.type
      name.className = "layer-name"

      name.onmousedown = (e) => e.stopPropagation()

      name.onchange = () => {
        widget.name = name.value
        if (onRename) onRename(widget)
      }

      left.appendChild(eye)
      left.appendChild(name)

      // =========================
      // RIGHT
      // =========================
      const right = document.createElement("div")
      right.className = "layer-right"

      const del = document.createElement("button")
      del.innerHTML = "🗑"
      del.className = "layer-delete"

      del.onclick = (e) => {
        e.stopPropagation()

        if (confirm("Delete widget?")) {
          fetch(`/api/widgets/${widget._id}`, { method: "DELETE" })
            .then(() => location.reload())
        }
      }

      right.appendChild(del)

      item.appendChild(left)
      item.appendChild(right)

      // =========================
      // SELECT
      // =========================
      item.onclick = () => {
        const el = document.querySelector(`[data-widget-id="${widget._id}"]`)
        if (el && onSelect) onSelect(widget)
      }

      panel.appendChild(item)

      // =========================
      // CHILDREN
      // =========================
      const children = widgets.filter(w => w.parent === widget._id)
      children.forEach(child => createItem(child, level + 1))
    }

    const roots = widgets.filter(w => !w.parent)
    roots.forEach(w => createItem(w))
  }
}