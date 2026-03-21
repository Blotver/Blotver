// blotver\public\js\editor\editorRenderer.js

window.EditorRenderer = {
  renderAll({ widgets, canvas, onSelect }) {

    if (!canvas) return;

    canvas.innerHTML = "";

    const tree = WidgetEngine.buildTree(widgets);

    WidgetEngine.renderTree({
      nodes: tree,
      parentEl: canvas,
      context: {
        mode: "editor",
        canvas,
        onSelect
      }
    });

  },

};

function reorderWidgets(dragId, targetId) {

  const dragged = widgets.find(w => w._id === dragId)
  const target = widgets.find(w => w._id === targetId)

  if (!dragged || !target) return

  // 🔥 SOLO reorder dentro del mismo padre
  if (dragged.parent !== target.parent) return

  const siblings = widgets.filter(w => w.parent === dragged.parent)

  const fromIndex = siblings.findIndex(w => w._id === dragId)
  const toIndex = siblings.findIndex(w => w._id === targetId)

  if (fromIndex === -1 || toIndex === -1) return

  const moved = siblings.splice(fromIndex, 1)[0]
  siblings.splice(toIndex, 0, moved)

  // 🔥 aplicar orden SOLO a ese grupo
  siblings.forEach((w, i) => {
    w.data.zIndex = i
  })

  EditorLayers.render({
    widgets,
    onSelect: (widget) => {
      const el = document.querySelector(`[data-widget-id="${widget._id}"]`)
      if (el) selectWidget(widget, el)
    },
    onToggleVisibility: (widget) => {
      const el = document.querySelector(`[data-widget-id="${widget._id}"]`)
      if (el) {
        el.style.display = widget.data.visible === false ? "none" : "block"
      }
      markAsChanged()
    },
    onRename: () => {
      markAsChanged()
    },
    onReorder: reorderWidgets
  })

  EditorRenderer.renderAll({
    widgets,
    canvas: document.getElementById("canvas"),
    onSelect: (widget, el) => selectWidget(widget, el)
  })

  EditorInteractions.apply({
    widgets,
    socket
  });

  markAsChanged()
}