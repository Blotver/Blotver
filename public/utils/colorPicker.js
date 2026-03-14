window.createColorPicker = function(container, initialColor, onChange){

let hue = 0;
let sat = 1;
let val = 1;

const preview = document.createElement("div");
preview.className="color-preview";
preview.style.background=initialColor||"#ffffff";

container.appendChild(preview);

let panel=null;

preview.onclick=()=>{

if(panel){
panel.remove();
panel=null;
return;
}

panel=document.createElement("div");
panel.className="color-picker-panel";

panel.innerHTML=`

<div class="color-sat">
<div class="white"></div>
<div class="black"></div>
<div class="color-cursor"></div>
</div>

<div class="color-hue"></div>

<div class="color-bottom">
<input class="color-input" value="${initialColor||"#ffffff"}">
<button class="color-clear">CLEAR</button>
</div>

`;

container.appendChild(panel);

const satBox=panel.querySelector(".color-sat");
const cursor=panel.querySelector(".color-cursor");
const hueBar=panel.querySelector(".color-hue");
const input=panel.querySelector(".color-input");

function hsvToHex(h,s,v){

let f=(n,k=(n+h/60)%6)=>v-v*s*Math.max(Math.min(k,4-k,1),0);

let r=Math.round(f(5)*255);
let g=Math.round(f(3)*255);
let b=Math.round(f(1)*255);

return "#"+[r,g,b].map(x=>x.toString(16).padStart(2,"0")).join("");

}

function updateColor(){

const hex=hsvToHex(hue,sat,val);

preview.style.background=hex;

input.value=hex;

onChange(hex);

}

satBox.addEventListener("mousedown",e=>{

function move(ev){

const rect=satBox.getBoundingClientRect();

let x=(ev.clientX-rect.left)/rect.width;
let y=(ev.clientY-rect.top)/rect.height;

x=Math.max(0,Math.min(1,x));
y=Math.max(0,Math.min(1,y));

sat=x;
val=1-y;

cursor.style.left=(x*100)+"%";
cursor.style.top=(y*100)+"%";

updateColor();

}

move(e);

window.addEventListener("mousemove",move);
window.addEventListener("mouseup",()=>{

window.removeEventListener("mousemove",move);

},{once:true});

});

hueBar.addEventListener("mousedown",e=>{

function move(ev){

const rect=hueBar.getBoundingClientRect();

let x=(ev.clientX-rect.left)/rect.width;

x=Math.max(0,Math.min(1,x));

hue=360*x;

satBox.style.background=`hsl(${hue},100%,50%)`;

updateColor();

}

move(e);

window.addEventListener("mousemove",move);
window.addEventListener("mouseup",()=>{

window.removeEventListener("mousemove",move);

},{once:true});

});

input.addEventListener("input",()=>{

preview.style.background=input.value;
onChange(input.value);

});

panel.querySelector(".color-clear").onclick=()=>{

preview.style.background="transparent";
input.value="";
onChange("");

};

};

document.addEventListener("click",e=>{

if(panel && !container.contains(e.target)){

panel.remove();
panel=null;

}

});

};
