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

  rerenderWidget({ widget, element }) {
    if (!widget || !element) return;

    const parent = element.parentElement;
    if (!parent) return;

    // 🔥 guardar estilos actuales
    const prevStyle = {
      left: element.style.left,
      top: element.style.top,
      width: element.style.width,
      height: element.style.height
    };

    // borrar viejo
    parent.removeChild(element);

    // render nuevo
    const newEl = WidgetEngine.renderSingle({
      widget,
      context: {
        mode: "editor",
        canvas: document.getElementById("canvas")
      }
    });

    // 🔥 restaurar estilos
    Object.assign(newEl.style, prevStyle);

    parent.appendChild(newEl);
    
    EditorInteractions.apply({
      widgets,
      socket
    });

    return newEl;
  }

};

function reorderWidgets(dragId, targetId) {

  const draggedIndex = widgets.findIndex(w => w._id === dragId)
  const targetIndex = widgets.findIndex(w => w._id === targetId)

  if (draggedIndex === -1 || targetIndex === -1) return

  const dragged = widgets[draggedIndex]
  const target = widgets[targetIndex]

  // 🔥 SOLO mismo padre
  if (dragged.parent !== target.parent) return

  // 🔥 sacar del array real
  const [moved] = widgets.splice(draggedIndex, 1)

  // 🔥 insertar en nueva posición
  widgets.splice(targetIndex, 0, moved)

  // 🔥 recalcular zIndex SOLO de siblings reales
  const siblings = widgets.filter(w => w.parent === dragged.parent)

  siblings.forEach((w, i) => {
    w.data.zIndex = i
  })

  // =========================
  // 🔄 RE-RENDER TODO
  // =========================

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
  })

  markAsChanged()
}