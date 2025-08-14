import { canvas, ctx } from "../core/game.js";

export class PowerUp {
    constructor(x, y) {
        this.width = 20;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.image = new Image();
        this.image.src = "img/powerup.png";
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        ctx.rotate(Math.PI);
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}
