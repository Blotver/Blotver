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
      item.className = `
        flex items-center justify-between
        bg-gray-800/60 hover:bg-gray-700/80
        px-3 py-2 rounded-lg
        transition text-sm
        border border-transparent
      `
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
        item.classList.add("border-purple-500", "bg-purple-500/10")
      }

      item.ondragleave = () => {
        item.classList.remove("border-purple-500", "bg-purple-500/10")
      }

      item.ondrop = () => {
        item.classList.remove("border-purple-500", "bg-purple-500/10")
        item.style.opacity = "1"

        if (dragId && dragId !== widget._id) {
          if (onReorder) onReorder(dragId, widget._id)
        }
      }

      // =========================
      // LEFT
      // =========================
      const left = document.createElement("div")
      left.className = "flex items-center gap-2 flex-1 min-w-0"

      // 👁 VISIBILITY BUTTON (SVG)
      const eye = document.createElement("button")
      eye.className = "w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 transition shrink-0"

      function getEyeIcon(visible) {
        return visible
          ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
             </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                 d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.27-2.944-9.543-7a9.956 9.956 0 012.223-3.592M6.223 6.223A9.956 9.956 0 0112 5c4.478 0 8.27 2.944 9.543 7a9.956 9.956 0 01-4.421 5.168M3 3l18 18"/>
             </svg>`
      }

      eye.innerHTML = getEyeIcon(!isHidden)

      eye.onclick = (e) => {
        e.stopPropagation()

        widget.data.visible = !widget.data.visible
        eye.innerHTML = getEyeIcon(widget.data.visible)

        if (onToggleVisibility) onToggleVisibility(widget)
      }

      // 📝 NAME
      const name = document.createElement("input")
      name.value = widget.name || widget.type
      name.className = `
        bg-transparent outline-none
        text-gray-200 placeholder-gray-500
        w-full truncate
      `

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
      right.className = "flex items-center"

      // 🗑 DELETE BUTTON (SVG)
      const del = document.createElement("button")
      del.className = "w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 transition"

      del.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6M5 7l1 12h12l1-12"/>
        </svg>
      `

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

        // highlight visual
        document.querySelectorAll("#layersPanel > div").forEach(i => {
          i.classList.remove("ring-2", "ring-purple-500", "bg-gray-700/80")
        })

        item.classList.add("ring-2", "ring-purple-500", "bg-gray-700/80")
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