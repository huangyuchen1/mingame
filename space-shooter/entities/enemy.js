import { canvas, ctx } from "../core/game.js";
import { createExplosion } from "./particle.js";

export class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 0.4 + Math.random() * 0.4;
        this.maxHp = 3;
        this.hp = this.maxHp;

        const imgIndex = Math.random() < 0.5 ? "enemy-1.png" : "enemy-2.png";
        this.image = new Image();
        this.image.src = `img/${imgIndex}`;
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(1, -1);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        // 血条
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = "lime";
        ctx.fillRect(this.x, this.y - 8, (this.hp / this.maxHp) * this.width, 4);
    }

    onDestroy() {
        createExplosion(this.x + this.width / 2, this.y + this.height / 2);
    }
}
