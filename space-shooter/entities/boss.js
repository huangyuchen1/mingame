import { canvas, ctx, player } from "../core/game.js";
import { Bullet } from "./bullet.js";

export class Boss {
    constructor() {
        this.width = 150;
        this.height = 150;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 50;
        this.hp = 100;
        this.maxHp = 100;
        this.bullets = [];
        this.image = new Image();
        this.image.src = "img/boss-1.png";
        this.lastShootTime = 0;
    }

    update() {
        let now = performance.now();
        if (now - this.lastShootTime > 500) {
            this.shoot();
            this.lastShootTime = now;
        }
        this.bullets.forEach((b, i) => {
            b.move();
            if (b.y > canvas.height) this.bullets.splice(i, 1);
        });
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(Math.PI); // 旋转180度
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        this.bullets.forEach(b => b.draw());
    }

    drawHPBar() {
        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width / 2 - 200, 10, 400, 20);
        ctx.fillStyle = "lime";
        ctx.fillRect(canvas.width / 2 - 200, 10, (this.hp / this.maxHp) * 400, 20);
        ctx.strokeStyle = "black";
        ctx.strokeRect(canvas.width / 2 - 200, 10, 400, 20);
    }

    shoot() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        for (let i = -2; i <= 2; i++) {
            this.bullets.push(new Bullet(cx + i * 15, cy, i, 4));
        }
    }

    onDestroy() {
        // 可以加爆炸动画
    }
}
