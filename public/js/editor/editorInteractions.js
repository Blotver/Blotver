window.EditorInteractions = {

  apply({ widgets, socket }) {

    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    document.querySelectorAll("[data-widget-id]").forEach(el => {

      const widgetId = el.dataset.widgetId;

      // 🔥 limpiar interact previo
      try {
        interact(el).unset();
      } catch (e) {}

      interact(el)

        // ======================
        // DRAG
        // ======================
        .draggable({
          listeners: {
            move(event) {

              const target = event.target;

              const left = parseFloat(target.style.left) || 0;
              const top = parseFloat(target.style.top) || 0;

              const newLeft = left + event.dx;
              const newTop = top + event.dy;

              target.style.left = newLeft + "px";
              target.style.top = newTop + "px";

              socket.emit("widget:updateLive", {
                id: widgetId,
                data: {
                  x: newLeft / canvas.clientWidth,
                  y: newTop / canvas.clientHeight
                }
              });
            },

            end(event) {

              const target = event.target;

              const widget = widgets.find(w => w._id === widgetId);
              if (!widget) return;

              const left = parseFloat(target.style.left) || 0;
              const top = parseFloat(target.style.top) || 0;

              widget.data.x = left / canvas.clientWidth;
              widget.data.y = top / canvas.clientHeight;

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
            move(event) {

              const target = event.target;

              const width = event.rect.width;
              const height = event.rect.height;

              target.style.width = width + "px";
              target.style.height = height + "px";

              socket.emit("widget:updateLive", {
                id: widgetId,
                data: {
                  width: width / canvas.clientWidth,
                  height: height / canvas.clientHeight
                }
              });
            },

            end(event) {

              const target = event.target;

              const widget = widgets.find(w => w._id === widgetId);
              if (!widget) return;

              const width = parseFloat(target.style.width) || 0;
              const height = parseFloat(target.style.height) || 0;

              widget.data.width = width / canvas.clientWidth;
              widget.data.height = height / canvas.clientHeight;

              if (window.markAsChanged) markAsChanged();
            }
          }
        });

    });

  }

};