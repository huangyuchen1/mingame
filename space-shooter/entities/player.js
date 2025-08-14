import { canvas, ctx } from "../core/game.js";
import { bullets, Bullet } from "./bullet.js";

export class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 6;
        this.dx = 0;
        this.dy = 0;
        this.image = new Image();
        this.image.src = "img/player-1.png";
        this.hp = 100;
        this.shootType = 0; // 武器等级
        this.lastShootTime = 0;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.drawHealthBar();
    }

    drawHealthBar() {
        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width - 200, 30, 180, 20);
        ctx.fillStyle = "green";
        ctx.fillRect(canvas.width - 200, 30, (this.hp / 100) * 180, 20);
        ctx.strokeStyle = "black";
        ctx.strokeRect(canvas.width - 200, 30, 180, 20);
    }

    autoShoot() {
        let now = performance.now();
        if (now - this.lastShootTime > 150) {
            this.shoot();
            this.lastShootTime = now;
        }
    }

    shoot() {
        const cx = this.x + this.width / 2 - 2;
        const cy = this.y;

        switch (this.shootType) {
            case 0:
                bullets.push(new Bullet(cx, cy));
                break;
            case 1:
                bullets.push(new Bullet(cx - 10, cy));
                bullets.push(new Bullet(cx + 10, cy));
                break;
            case 2:
                bullets.push(new Bullet(cx - 20, cy));
                bullets.push(new Bullet(cx, cy));
                bullets.push(new Bullet(cx + 20, cy));
                break;
            case 3:
                bullets.push(new Bullet(cx, cy));
                bullets.push(new Bullet(cx - 20, cy, -2, -5));
                bullets.push(new Bullet(cx + 20, cy, 2, -5));
                bullets.push(new Bullet(cx - 40, cy, -3, -4));
                bullets.push(new Bullet(cx + 40, cy, 3, -4));
                break;
            case 4:
                for (let i = 0; i < 12; i++) {
                    let angle = (Math.PI * 2 / 12) * i;
                    bullets.push(new Bullet(cx, cy, Math.cos(angle) * 4, Math.sin(angle) * 4));
                }
                break;
            case 5:
                bullets.push(new Bullet(cx - 20, cy));
                bullets.push(new Bullet(cx, cy));
                bullets.push(new Bullet(cx + 20, cy));
                bullets.push(new Bullet(cx - 20, cy - 15));
                bullets.push(new Bullet(cx, cy - 15));
                bullets.push(new Bullet(cx + 20, cy - 15));
                break;
        }
    }

    upgradeWeapon() {
        if (this.shootType < 5) this.shootType++;
    }
}
