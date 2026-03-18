window.EditorRenderer = {

  renderAll({ widgets, canvas, onSelect }) {

    if (!canvas) return;

    canvas.innerHTML = "";

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