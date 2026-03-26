// blotver/public/js/core/renderer.js

window.Renderer = {

  renderChildren(wrapper, parentData, children, screenW, screenH) {

    // 🔥 construir árbol real
    const map = new Map();

    children.forEach(c => {
      c.children = [];
      map.set(c.id || Math.random(), c);
    });

    // ⚠️ Como no tenés estructura real acá, todo va como root
    // 👉 pero dejamos preparado para futuro parent real

    renderRecursive(wrapper, children, parentData, screenW, screenH);


    function renderRecursive(parentEl, children, parentData, screenW, screenH) {

      children.forEach(child => {

        if (!child || !child.data) return;

        const d = child.data;

        const parentW = parentEl.clientWidth || screenW;
        const parentH = parentEl.clientHeight || screenH;

        const x = (d.x ?? 0) * parentW;
        const y = (d.y ?? 0) * parentH;
        const w = (d.width ?? 0.2) * parentW;
        const h = (d.height ?? 0.1) * parentH;

        let el = null;

        const widgetDef = window.WidgetRegistry?.[child.type];

        if (widgetDef?.renderOverlay) {
          el = widgetDef.renderOverlay(child, parentData);
        } else {

          if (child.type === "image") {
            el = document.createElement("img");
            StyleEngine.applyImage(el, d);
          }

          else if (child.type === "text") {

            const container = document.createElement("div");
            const inner = document.createElement("div");

            const parsed = Utils.parseVariables(d.text || "", parentData);
            inner.innerHTML = parsed;

            container.style.display = "flex";
            container.style.alignItems = "center";

            if (d.textAlign === "left")
              container.style.justifyContent = "flex-start";
            else if (d.textAlign === "right")
              container.style.justifyContent = "flex-end";
            else
              container.style.justifyContent = "center";

            StyleEngine.applyText(inner, d);
            StyleEngine.applyTextContainer(container, d);

            container.appendChild(inner);
            el = container;
          }
        }

        if (!el) return;

        if (d.visible === false) {
          el.style.display = "none";
        }

        el.style.position = "absolute";
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.width = w + "px";
        el.style.height = h + "px";
        el.style.zIndex = d.zIndex ?? 0;
        el.style.pointerEvents = "auto";

        parentEl.appendChild(el);

        // 🔥 RECURSIVIDAD (LA CLAVE)
        if (child.children && child.children.length) {
          renderRecursive(el, child.children, parentData, screenW, screenH);
        }

      });
    }

  }

};