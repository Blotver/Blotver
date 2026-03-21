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

      const el = widgetDef.render({
        widget: node,
        context
      });

      if (!el) return;

      parentEl.appendChild(el);

      if (node.children && node.children.length > 0) {
        this.renderTree({
          nodes: node.children,
          parentEl: el,
          context
        });
      }

    });

  }

};