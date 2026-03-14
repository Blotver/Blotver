window.createColorPicker = function (container, initialColor, onChange) {

  const preview = document.createElement("div");
  preview.className = "color-preview";

  preview.style.background = initialColor || "#ffffff";

  container.appendChild(preview);

  const pickr = Pickr.create({

    el: preview,

    theme: "monolith",

    default: initialColor || "#ffffff",

    useAsButton: true,

    position: "bottom-middle",

    components: {

      preview: true,

      opacity: true,

      hue: true,

      palette: true,

      interaction: {

        hex: true,
        rgba: true,
        input: true,
        clear: false,
        save: false

      }

    }

  });

  pickr.on("change", (color) => {

    const hex = color.toHEXA().toString();

    preview.style.background = hex;

    onChange(hex);

  });

  pickr.on("init", instance => {

    const palette = document.createElement("div");
    palette.className = "color-palette";

    const colors = [
      "#ffffff",
      "#ffd166",
      "#f59e0b",
      "#6366f1",
      "#ec4899",
      "#ef4444"
    ];

    colors.forEach(c => {

      const sw = document.createElement("div");
      sw.className = "color-swatch";
      sw.style.background = c;

      sw.onclick = () => {

        instance.setColor(c);
        onChange(c);

      };

      palette.appendChild(sw);

    });

    instance.getRoot().app.appendChild(palette);

  });

};