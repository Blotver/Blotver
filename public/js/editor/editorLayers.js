window.EditorLayers = {

  render({ widgets, onSelect, onToggleVisibility, onRename }) {

    const panel = document.getElementById("layersPanel")
    if (!panel) return

    panel.innerHTML = ""

    function createItem(widget, level = 0) {

      const isHidden = widget.data.visible === false

      const item = document.createElement("div")

      item.className = `
      group relative flex items-center justify-between
      px-3 py-2 rounded-xl
      bg-white/[0.03]
      hover:bg-white/[0.06]
      border border-transparent
      hover:border-purple-500/30
      transition-all duration-200
      cursor-pointer
      backdrop-blur-md
      `

      item.style.marginLeft = (level * 14) + "px"
      item.dataset.id = widget._id

      // =========================
      // LEFT SIDE
      // =========================
      const left = document.createElement("div")
      left.className = "flex items-center gap-2 flex-1 min-w-0"

      // ICON (por tipo)
      const icon = document.createElement("div")
      icon.className = "w-5 h-5 flex items-center justify-center text-gray-400"

      icon.innerHTML = getIcon(widget.type)

      // VISIBILITY BUTTON
      const eye = document.createElement("button")
      eye.className = `
      w-6 h-6 flex items-center justify-center
      rounded-md
      text-gray-400
      hover:text-white
      hover:bg-white/10
      transition
      `

      eye.innerHTML = isHidden ? eyeOffIcon() : eyeIcon()

      eye.onclick = (e) => {
        e.stopPropagation()

        widget.data.visible = !widget.data.visible

        eye.innerHTML = widget.data.visible ? eyeIcon() : eyeOffIcon()

        if (onToggleVisibility) onToggleVisibility(widget)
      }

      // NAME INPUT
      const name = document.createElement("input")
      name.value = widget.name || widget.type

      name.className = `
      bg-transparent
      text-sm
      text-gray-200
      outline-none
      truncate
      w-full
      focus:text-white
      `

      name.onchange = () => {
        widget.name = name.value
        if (onRename) onRename(widget)
      }

      // =========================
      // RIGHT SIDE
      // =========================
      const right = document.createElement("div")
      right.className = `
      flex items-center gap-1
      opacity-0 group-hover:opacity-100
      transition
      `

      // DELETE BUTTON
      const del = document.createElement("button")
      del.className = `
      w-7 h-7 flex items-center justify-center
      rounded-lg
      text-gray-400
      hover:text-red-400
      hover:bg-red-500/10
      transition
      `

      del.innerHTML = trashIcon()

      del.onclick = (e) => {
        e.stopPropagation()

        if (confirm("Delete widget?")) {
          fetch(`/api/widgets/${widget._id}`, { method: "DELETE" })
            .then(() => location.reload())
        }
      }

      // =========================
      // BUILD
      // =========================
      left.appendChild(icon)
      left.appendChild(eye)
      left.appendChild(name)

      right.appendChild(del)

      item.appendChild(left)
      item.appendChild(right)

      // SELECT
      item.onclick = () => {
        const el = document.querySelector(`[data-widget-id="${widget._id}"]`)
        if (el && onSelect) onSelect(widget, el)
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


// =========================
// ICONS (SVG PRO 🔥)
// =========================

function eyeIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg"
    class="w-4 h-4"
    fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="1.5">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12 18 19.5 12 19.5 2.25 12 2.25 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>`
}

function eyeOffIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg"
    class="w-4 h-4"
    fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="1.5">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M3 3l18 18M10.584 10.587a3 3 0 004.243 4.243M9.88 5.09A9.77 9.77 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a16.93 16.93 0 01-4.293 5.774M6.53 6.53C4.73 8.02 3.25 12 3.25 12s3.75 7.5 9.75 7.5c1.64 0 3.13-.42 4.47-1.13" />
  </svg>`
}

function trashIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg"
    class="w-4 h-4"
    fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="1.5">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M6 7h12M9 7v10m6-10v10M10 4h4m-7 3l1 13h8l1-13" />
  </svg>`
}

function getIcon(type) {

  if (type === "text") {
    return `
    <svg xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4"
      fill="none" viewBox="0 0 24 24"
      stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round"
        d="M4 6h16M4 12h10M4 18h7"/>
    </svg>`
  }

  if (type === "image") {
    return `
    <svg xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4"
      fill="none" viewBox="0 0 24 24"
      stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 15l5-5 4 4 5-5 4 4"/>
    </svg>`
  }

  if (type === "shoutout") {
    return `
    <svg xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4"
      fill="none" viewBox="0 0 24 24"
      stroke="currentColor" stroke-width="1.5">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>`
  }

  return `
  <svg xmlns="http://www.w3.org/2000/svg"
    class="w-4 h-4"
    fill="none" viewBox="0 0 24 24"
    stroke="currentColor" stroke-width="1.5">
    <rect x="4" y="4" width="16" height="16" rx="3"/>
  </svg>`
}