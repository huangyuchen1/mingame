import { canvas, ctx } from "../core/game.js";

export let bullets = [];

export class Bullet {
    constructor(x, y, dx = 0, dy = -6) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speedX = dx;
        this.speedY = dy;
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw() {
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

export function updateBullets() {
    bullets.forEach((bullet, i) => {
        bullet.move();
        if (bullet.y < 0 || bullet.y > canvas.height) bullets.splice(i, 1);
    });
}

export function drawBullets() {
    bullets.forEach(b => b.draw());
}
