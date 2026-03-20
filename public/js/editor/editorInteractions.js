// blotver/public/js/editor/editorInteractions.js

window.EditorInteractions = {

  apply({ widgets, socket }) {

    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const GRID = 10;
    const SNAP_THRESHOLD = 6;
    const MIN_SIZE = 30;

    let lastEmit = 0;
    const EMIT_DELAY = 16;

    function emit(data) {
      const now = Date.now();
      if (now - lastEmit < EMIT_DELAY) return;
      lastEmit = now;
      socket.emit("widget:updateLive", data);
    }

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const snap = (v) => Math.round(v / GRID) * GRID;

    // ======================
    // GUIDES (visual snap lines)
    // ======================
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

    // ======================
    // INTERACTIONS
    // ======================
    document.querySelectorAll("[data-widget-id]").forEach(el => {

      const widgetId = el.dataset.widgetId;

      if (interact.isSet && interact.isSet(el)) {
        interact(el).unset();
      }

      const getParent = () => el.parentElement.getBoundingClientRect();

      // ======================
      // DRAG
      // ======================
      interact(el).draggable({

        listeners: {

          move(event) {

            const target = event.target;

            let x = parseFloat(target.style.left) || 0;
            let y = parseFloat(target.style.top) || 0;

            x += event.dx;
            y += event.dy;

            const parent = getParent();

            const w = target.offsetWidth;
            const h = target.offsetHeight;

            // límites
            x = clamp(x, 0, parent.width - w);
            y = clamp(y, 0, parent.height - h);

            // snap grid (SHIFT)
            if (event.shiftKey) {
              x = snap(x);
              y = snap(y);
            }

            // snap edges
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

            // center snap
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
          },

          end(event) {

            hideGuides();

            const target = event.target;
            const widget = widgets.find(w => w._id === widgetId);
            if (!widget) return;

            const parent = getParent();

            const x = parseFloat(target.style.left) || 0;
            const y = parseFloat(target.style.top) || 0;

            widget.data.x = x / parent.width;
            widget.data.y = y / parent.height;

            if (window.markAsChanged) markAsChanged();
          }
        }
      })

        // ======================
        // RESIZE PRO
        // ======================
        .resizable({

          edges: {
            top: ".resize-handle.top, .resize-handle.tl, .resize-handle.tr",
            bottom: ".resize-handle.bottom, .resize-handle.bl, .resize-handle.br",
            left: ".resize-handle.left, .resize-handle.tl, .resize-handle.bl",
            right: ".resize-handle.right, .resize-handle.tr, .resize-handle.br"
          },

          listeners: {

            move(event) {

              const target = event.target;

              let x = parseFloat(target.style.left) || 0;
              let y = parseFloat(target.style.top) || 0;

              let width = event.rect.width;
              let height = event.rect.height;

              const parent = getParent();

              // FIX real
              x += event.deltaRect.left;
              y += event.deltaRect.top;

              // SHIFT = ratio
              if (event.shiftKey) {
                const ratio = target.offsetWidth / target.offsetHeight || 1;
                if (width / height > ratio) {
                  width = height * ratio;
                } else {
                  height = width / ratio;
                }
              }

              // ALT = center resize
              if (event.altKey) {
                x -= event.deltaRect.left;
                y -= event.deltaRect.top;
              }

              width = Math.max(MIN_SIZE, width);
              height = Math.max(MIN_SIZE, height);

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
              hideGuides();

              const target = el;
              const widget = widgets.find(w => w._id === widgetId);
              if (!widget) return;

              const parent = getParent();

              const x = parseFloat(target.style.left) || 0;
              const y = parseFloat(target.style.top) || 0;
              const width = parseFloat(target.style.width) || 0;
              const height = parseFloat(target.style.height) || 0;

              widget.data.x = x / parent.width;
              widget.data.y = y / parent.height;
              widget.data.width = width / parent.width;
              widget.data.height = height / parent.height;

              if (window.markAsChanged) markAsChanged();
            }
          }
        });
    });
    
    // ======================
    // KEYBOARD MOVE (PRO)
    // ======================
    document.addEventListener("keydown", (e) => {

      if (!el.classList.contains("selected-widget")) return;

      const parent = getParent();

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

  }

};