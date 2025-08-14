import { canvas, ctx } from "./game.js";

const bgImage = new Image();
bgImage.src = "img/space-bg.png";
let bgY1 = 0;
let bgY2 = -window.innerHeight;
let bgSpeed = 1.5;

export function updateBackground() {
    bgY1 += bgSpeed;
    bgY2 += bgSpeed;
    if (bgY1 >= canvas.height) bgY1 = -canvas.height;
    if (bgY2 >= canvas.height) bgY2 = -canvas.height;
}

export function drawBackground() {
    ctx.drawImage(bgImage, 0, bgY1, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, bgY2, canvas.width, canvas.height);
}
