// blotver\public\js\editor\editorRenderer.js

window.EditorRenderer = {

  renderAll({ widgets, canvas, onSelect }) {

    if (!canvas) return;

    canvas.innerHTML = "";

    widgets.sort((a, b) => (a.data.zIndex || 0) - (b.data.zIndex || 0))

    const rootWidgets = widgets.filter(w => !w.parent);

    rootWidgets.forEach(w => {
      this.renderWidget({
        widget: w,
        widgets,
        parentEl: canvas, // 🔥 CAMBIO
        canvas,
        onSelect
      });
    });

  },


  renderWidget({ widget, widgets, parentEl, canvas, onSelect }) {

    const el = document.createElement("div");
    el.dataset.widgetId = widget._id;

    const widgetDef = window.WidgetRegistry[widget.type];

    // ===== CONTENIDO =====
    if (widgetDef && widgetDef.renderCanvas) {
      const content = widgetDef.renderCanvas(widget);
      el.appendChild(content);
    }

    // ===== ESTILOS =====
    el.className = "absolute cursor-move select-none draggable-resizable";

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    el.style.left = (widget.data.x * canvasWidth) + "px";
    el.style.top = (widget.data.y * canvasHeight) + "px";

    if (widget.data.width)
      el.style.width = (widget.data.width * canvasWidth) + "px";

    if (widget.data.height)
      el.style.height = (widget.data.height * canvasHeight) + "px";

    el.style.zIndex = widget.data?.zIndex ?? 0;

    if (widget.data.visible === false) {
      el.style.display = "none";
    }

    // 🔥 IMPORTANTE PARA CHILDREN
    el.style.position = "absolute";

    // ===== SELECT =====
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect(widget, el);
    });

    widget.el = el;

    // 🔥 AHORA VA AL PADRE
    parentEl.appendChild(el);

    // ===== CHILDREN (FIX REAL) =====
    const children = widgets.filter(w => w.parent === widget._id);

    children.forEach(child => {
      this.renderWidget({
        widget: child,
        widgets,
        parentEl: el, // 🔥🔥🔥 ACA ESTA LA MAGIA
        canvas,
        onSelect
      });
    });

  },


  rerenderWidget({ widget, element }) {

    if (!widget || !element) return;

    const widgetDef = window.WidgetRegistry[widget.type];

    if (!widgetDef || !widgetDef.renderCanvas) return;

    element.innerHTML = "";

    const content = widgetDef.renderCanvas(widget);

    element.appendChild(content);

  }
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
    onToggleVisibility,
    onRename,
    onReorder: reorderWidgets
  })

  updatePreview()
  markAsChanged()
}