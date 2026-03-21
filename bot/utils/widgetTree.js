// blotver\bot\utils\widgetTree.js

export function buildWidgetTree(widgets) {

  const map = new Map();
  const roots = [];

  // 1. Crear mapa
  widgets.forEach(w => {
    map.set(w._id, { ...w, children: [] });
  });

  // 2. Armar árbol
  widgets.forEach(w => {

    if (w.parent) {
      const parent = map.get(w.parent);

      if (parent) {
        parent.children.push(map.get(w._id));
      } else {
        // fallback (parent roto)
        roots.push(map.get(w._id));
      }

    } else {
      roots.push(map.get(w._id));
    }

  });

  return roots;
}