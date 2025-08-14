import { player, initGame } from "./game.js";

export function setupInput() {
    // 键盘
    document.addEventListener("keydown", (e) => {
        if (e.key === "a" || e.key === "A") player.dx = -player.speed;
        if (e.key === "d" || e.key === "D") player.dx = player.speed;
        if (e.key === "w" || e.key === "W") player.dy = -player.speed;
        if (e.key === "s" || e.key === "S") player.dy = player.speed;
        if (e.key === "r" || e.key === "R") initGame();
    });

    document.addEventListener("keyup", (e) => {
        if (["a","A","d","D"].includes(e.key)) player.dx = 0;
        if (["w","W","s","S"].includes(e.key)) player.dy = 0;
    });

    // 手机触控
    let touchX = null, touchY = null;
    const canvas = document.getElementById("gameCanvas");

    canvas.addEventListener("touchstart", (e) => {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
    });

    canvas.addEventListener("touchmove", (e) => {
        let currentX = e.touches[0].clientX;
        let currentY = e.touches[0].clientY;
        player.x += currentX - touchX;
        player.y += currentY - touchY;
        touchX = currentX;
        touchY = currentY;
    });

    canvas.addEventListener("touchend", () => {
        touchX = null;
        touchY = null;
    });
}
