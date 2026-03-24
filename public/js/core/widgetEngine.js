// blotver\public\js\core\widgetEngine.js
window.WidgetEngine = {

  buildTree(widgets) {

    const map = new Map();
    const roots = [];

    widgets.forEach(w => {
      map.set(w._id || Math.random(), { ...w, children: [] });
    });

    widgets.forEach(w => {

      const node = map.get(w._id);

      if (w.parent) {
        const parent = map.get(w.parent);

        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node); // fallback
        }

      } else {
        roots.push(node);
      }

    });

    return roots;
  },

  renderTree({ nodes, parentEl, context }) {

    nodes.forEach(node => {

      const widgetDef = window.WidgetRegistry[node.type];
      if (!widgetDef) return;

      let el = null;

      // ✅ NUEVO SISTEMA
      if (typeof widgetDef.render === "function") {

        el = widgetDef.render({
          widget: node,
          context
        });

      }

      // ✅ FALLBACK (TU SISTEMA VIEJO)
      else if (typeof widgetDef.renderCanvas === "function") {

        el = document.createElement("div");

        const parentW = context.canvas.clientWidth;
        const parentH = context.canvas.clientHeight;

        const d = node.data;

        el.style.position = "absolute";
        el.style.left = (d.x * parentW) + "px";
        el.style.top = (d.y * parentH) + "px";
        el.style.width = (d.width * parentW) + "px";
        el.style.height = (d.height * parentH) + "px";
        el.style.zIndex = String(d.zIndex ?? 0);

        const inner = widgetDef.renderCanvas(node);

        if (inner) el.appendChild(inner);

      }

      // ❌ NO RENDER
      if (!el) return;

      // 🔥 IDENTIFICAR ELEMENTO
      el.dataset.widgetId = node._id;

      // 🔥 GUARDAR REFERENCIA (MUY IMPORTANTE)
      node._el = el;

      // 🔥 CLICK PARA SELECCIONAR (EDITOR)
      if (context.mode === "editor" && context.onSelect) {
        el.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          context.onSelect(node, el);
        });
      }

      parentEl.appendChild(el);

      if (node.children && node.children.length > 0) {
        this.renderTree({
          nodes: node.children,
          parentEl: el,
          context
        });
      }

    });

  },

  renderSingle({ widget, context }) {
    const def = window.WidgetRegistry[widget.type];
    if (!def || !def.render) return null;

    const el = def.render({ widget, context });

    el.dataset.widgetId = widget._id;

    // 🔥 GUARDAR REFERENCIA
    widget._el = el;

    return el;
  }

};

