window.createColorPicker = function (container, initialColor, onChange) {

  let hue = 0;
  let sat = 1;
  let val = 1;

  const startColor = initialColor || "#ffffff";

  const wrapper = document.createElement("div");
  wrapper.className = "color-field";

  const preview = document.createElement("div");
  preview.className = "color-preview";

  const value = document.createElement("div");
  value.className = "color-value";

  preview.style.background = startColor;
  value.textContent = startColor;

  wrapper.appendChild(preview);
  wrapper.appendChild(value);

  container.appendChild(wrapper);

  let panel = null;

  preview.onclick = () => {

    if (panel) {
      panel.remove();
      panel = null;
      return;
    }

    panel = document.createElement("div");
    panel.className = "color-picker-panel";

    panel.innerHTML = `
      <div class="color-sat">
        <div class="white"></div>
        <div class="black"></div>
        <div class="color-cursor"></div>
      </div>

      <div class="color-hue"></div>

      <div class="color-bottom">
        <input class="color-input" value="${startColor}">
        <button class="color-clear">CLEAR</button>
      </div>
    `;

    document.body.appendChild(panel);

    const rect = preview.getBoundingClientRect();

    panel.style.position = "absolute";
    panel.style.top = rect.bottom + 6 + "px";
    panel.style.left = rect.left + "px";

    const satBox = panel.querySelector(".color-sat");
    const cursor = panel.querySelector(".color-cursor");
    const hueBar = panel.querySelector(".color-hue");
    const input = panel.querySelector(".color-input");

    function hsvToHex(h, s, v) {

      let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);

      let r = Math.round(f(5) * 255);
      let g = Math.round(f(3) * 255);
      let b = Math.round(f(1) * 255);

      return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

    }

    function setColor(hex) {
      preview.style.background = hex;
      value.textContent = hex;
      input.value = hex;
      onChange(hex);
    }

    function updateColor() {
      const hex = hsvToHex(hue, sat, val);
      setColor(hex);
    }

    satBox.addEventListener("mousedown", e => {

      function move(ev) {

        const rect = satBox.getBoundingClientRect();

        let x = (ev.clientX - rect.left) / rect.width;
        let y = (ev.clientY - rect.top) / rect.height;

        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));

        sat = x;
        val = 1 - y;

        cursor.style.left = (x * 100) + "%";
        cursor.style.top = (y * 100) + "%";

        updateColor();

      }

      move(e);

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", move);
      }, { once: true });

    });

    hueBar.addEventListener("mousedown", e => {

      function move(ev) {

        const rect = hueBar.getBoundingClientRect();

        let x = (ev.clientX - rect.left) / rect.width;
        x = Math.max(0, Math.min(1, x));

        hue = 360 * x;

        satBox.style.background = `hsl(${hue},100%,50%)`;

        updateColor();

      }

      move(e);

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", () => {
        window.removeEventListener("mousemove", move);
      }, { once: true });

    });

    input.addEventListener("input", () => {
      setColor(input.value);
    });

    panel.querySelector(".color-clear").onclick = () => {
      setColor("");
    };

  };

  document.addEventListener("click", e => {

    if (panel && !container.contains(e.target) && !panel.contains(e.target)) {
      panel.remove();
      panel = null;
    }

  });

};