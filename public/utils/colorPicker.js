window.createColorPicker = function(container, initialColor, onChange) {

  const wrapper = document.createElement("div");
  wrapper.className = "color-picker-wrapper";

  const preview = document.createElement("div");
  preview.className = "color-preview";

  const input = document.createElement("input");
  input.className = "color-input";
  input.value = initialColor || "#ffffff";

  preview.style.background = input.value;

  wrapper.appendChild(preview);
  wrapper.appendChild(input);

  container.appendChild(wrapper);

  const pickr = Pickr.create({

    el: preview,

    theme: "nano",

    default: input.value,

    useAsButton: true,

    components: {

      preview: true,
      opacity: true,
      hue: true,

      interaction: {

        hex: true,
        rgba: true,
        input: true,
        save: true

      }

    }

  });

  pickr.on("save", (color) => {

    const hex = color.toHEXA().toString();

    preview.style.background = hex;
    input.value = hex;

    onChange(hex);

    pickr.hide();

  });

  input.addEventListener("input", () => {

    preview.style.background = input.value;

    onChange(input.value);

  });

};