import { ctx, canvas } from "../core/game.js";

export function drawHUD(score, time, hp) {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Survival Time: ${Math.floor(time)}s`, canvas.width - 240, 30);
}
