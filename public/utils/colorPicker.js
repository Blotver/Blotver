window.createColorPicker = function(container, initialColor, onChange){

const el = document.createElement("div");

container.appendChild(el);

const pickr = Pickr.create({

el: el,

theme: "monolith",

default: initialColor || "#ffffff",

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

onChange(hex);

pickr.hide();

});

};