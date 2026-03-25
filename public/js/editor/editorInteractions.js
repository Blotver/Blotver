// blotver/public/js/editor/editorInteractions.js

window.EditorInteractions = {

  apply({ widgets, socket }) {

    const canvas = document.getElementById("canvas");
    if (!canvas || !window.interact) return;

    // =========================
    // GLOBAL STATE (ANTI-BUG)
    // =========================
    if (!window.__interactionState) {
      window.__interactionState = {
        dragging: false,
        resizing: false,
        raf: null,
        lastEmit: 0,
        keyboardBound: false
      };
    }

    const state = window.__interactionState;

    // =========================
    // CONFIG
    // =========================
    const GRID = 10;
    const SNAP_THRESHOLD = 6;
    const MIN_SIZE = 30;
    const EMIT_DELAY = 16;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const snap = (v) => Math.round(v / GRID) * GRID;

    function safeParent(el) {
      if (!el || !el.parentElement) return null;
      return el.parentElement.getBoundingClientRect();
    }

    function emit(data) {
      const now = Date.now();
      if (now - state.lastEmit < EMIT_DELAY) return;
      state.lastEmit = now;

      if (!socket || socket.disconnected) return;

      socket.emit("widget:updateLive", data);
    }

    // =========================
    // GUIDES
    // =========================
    let guideX = null;
    let guideY = null;

    function createGuide() {
      const g = document.createElement("div");
      g.style.position = "absolute";
      g.style.background = "#3b82f6";
      g.style.zIndex = 9999;
      g.style.pointerEvents = "none";
      canvas.appendChild(g);
      return g;
    }

    function showGuides(x, y, parent) {
      if (!parent) return;

      if (x !== null) {
        if (!guideX) guideX = createGuide();
        guideX.style.width = "1px";
        guideX.style.height = parent.height + "px";
        guideX.style.left = x + "px";
        guideX.style.top = "0px";
      }

      if (y !== null) {
        if (!guideY) guideY = createGuide();
        guideY.style.height = "1px";
        guideY.style.width = parent.width + "px";
        guideY.style.top = y + "px";
        guideY.style.left = "0px";
      }
    }

    function hideGuides() {
      if (guideX) guideX.remove(), guideX = null;
      if (guideY) guideY.remove(), guideY = null;
    }

    // =========================
    // CLEAN OLD INTERACTIONS
    // =========================
    document.querySelectorAll("[data-widget-id]").forEach(el => {
      try {
        interact(el).unset();
      } catch (e) { }
    });
    // =========================
    // APPLY INTERACTIONS
    // =========================
    document.querySelectorAll("[data-widget-id]").forEach(el => {

      if (!el || !el.dataset.widgetId) return;

      const widgetId = el.dataset.widgetId;

      // ======================
      // DRAG
      // ======================
      interact(el).draggable({

        listeners: {

          start() {
            state.dragging = true;
          },

          move(event) {

            if (!event || !event.target) return;

            cancelAnimationFrame(state.raf);

            state.raf = requestAnimationFrame(() => {

              const target = event.target;
              const parent = safeParent(target);
              if (!parent) return;

              let x = parseFloat(target.style.left) || 0;
              let y = parseFloat(target.style.top) || 0;

              x += event.dx;
              y += event.dy;

              const w = target.offsetWidth;
              const h = target.offsetHeight;

              x = clamp(x, 0, parent.width - w);
              y = clamp(y, 0, parent.height - h);

              if (event.shiftKey) {
                x = snap(x);
                y = snap(y);
              }

              let snapX = null;
              let snapY = null;

              if (Math.abs(x) < SNAP_THRESHOLD) {
                x = 0;
                snapX = 0;
              }

              if (Math.abs(y) < SNAP_THRESHOLD) {
                y = 0;
                snapY = 0;
              }

              if (Math.abs((x + w) - parent.width) < SNAP_THRESHOLD) {
                x = parent.width - w;
                snapX = parent.width;
              }

              if (Math.abs((y + h) - parent.height) < SNAP_THRESHOLD) {
                y = parent.height - h;
                snapY = parent.height;
              }

              const centerX = x + w / 2;
              const centerY = y + h / 2;

              if (Math.abs(centerX - parent.width / 2) < SNAP_THRESHOLD) {
                x = parent.width / 2 - w / 2;
                snapX = parent.width / 2;
              }

              if (Math.abs(centerY - parent.height / 2) < SNAP_THRESHOLD) {
                y = parent.height / 2 - h / 2;
                snapY = parent.height / 2;
              }

              showGuides(snapX, snapY, parent);

              target.style.left = x + "px";
              target.style.top = y + "px";

              emit({
                id: widgetId,
                data: {
                  x: x / parent.width,
                  y: y / parent.height
                }
              });

            });
          },

          end(event) {

            state.dragging = false;
            hideGuides();

            if (!event || !event.target) return;

            const target = event.target;
            const parent = safeParent(target);
            if (!parent) return;

            const widget = widgets.find(w => w._id === widgetId);
            if (!widget) return;

            const x = parseFloat(target.style.left) || 0;
            const y = parseFloat(target.style.top) || 0;

            widget.data.x = x / parent.width;
            widget.data.y = y / parent.height;

            if (window.markAsChanged) markAsChanged();
          }
        }
      })

        // ======================
        // RESIZE
        // ======================
        .resizable({

          edges: {
            top: ".resize-handle.top, .resize-handle.tl, .resize-handle.tr",
            bottom: ".resize-handle.bottom, .resize-handle.bl, .resize-handle.br",
            left: ".resize-handle.left, .resize-handle.tl, .resize-handle.bl",
            right: ".resize-handle.right, .resize-handle.tr, .resize-handle.br"
          },

          listeners: {

            start() {
              state.resizing = true;
            },

            move(event) {

              if (!event || !event.target) return;

              const target = event.target;
              const parent = safeParent(target);
              if (!parent) return;

              let x = parseFloat(target.style.left) || 0;
              let y = parseFloat(target.style.top) || 0;

              let width = event.rect.width;
              let height = event.rect.height;

              x += event.deltaRect.left;
              y += event.deltaRect.top;

              if (event.shiftKey) {
                const ratio = target.offsetWidth / target.offsetHeight || 1;
                if (width / height > ratio) width = height * ratio;
                else height = width / ratio;
              }

              if (event.altKey) {
                x -= event.deltaRect.left;
                y -= event.deltaRect.top;
              }

              width = clamp(width, MIN_SIZE, parent.width - x);
              height = clamp(height, MIN_SIZE, parent.height - y);

              target.style.left = x + "px";
              target.style.top = y + "px";
              target.style.width = width + "px";
              target.style.height = height + "px";

              emit({
                id: widgetId,
                data: {
                  x: x / parent.width,
                  y: y / parent.height,
                  width: width / parent.width,
                  height: height / parent.height
                }
              });
            },

            end() {

              state.resizing = false;
              hideGuides();

              const parent = safeParent(el);
              if (!parent) return;

              const widget = widgets.find(w => w._id === widgetId);
              if (!widget) return;

              const x = parseFloat(el.style.left) || 0;
              const y = parseFloat(el.style.top) || 0;
              const width = parseFloat(el.style.width) || 0;
              const height = parseFloat(el.style.height) || 0;

              widget.data.x = x / parent.width;
              widget.data.y = y / parent.height;
              widget.data.width = width / parent.width;
              widget.data.height = height / parent.height;

              if (window.markAsChanged) markAsChanged();
            }
          }
        });

    });

    // =========================
    // KEYBOARD (NO DUPLICATE)
    // =========================
    if (!state.keyboardBound) {

      document.addEventListener("keydown", (e) => {

        if (state.dragging || state.resizing) return;

        const el = document.querySelector(".selected-widget");
        if (!el) return;

        const parent = safeParent(el);
        if (!parent) return;

        const widgetId = el.dataset.widgetId;
        const widget = widgets.find(w => w._id === widgetId);
        if (!widget) return;

        let step = 5;
        if (e.shiftKey) step = 20;
        if (e.altKey) step = 1;

        let x = parseFloat(el.style.left) || 0;
        let y = parseFloat(el.style.top) || 0;

        if (e.key === "ArrowUp") y -= step;
        if (e.key === "ArrowDown") y += step;
        if (e.key === "ArrowLeft") x -= step;
        if (e.key === "ArrowRight") x += step;

        x = clamp(x, 0, parent.width - el.offsetWidth);
        y = clamp(y, 0, parent.height - el.offsetHeight);

        el.style.left = x + "px";
        el.style.top = y + "px";

        emit({
          id: widgetId,
          data: {
            x: x / parent.width,
            y: y / parent.height
          }
        });

      });

      state.keyboardBound = true;
    }

  }

};