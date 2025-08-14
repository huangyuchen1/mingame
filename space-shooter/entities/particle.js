import { ctx } from "../core/game.js";

export let particles = [];

export class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.size = type === "spark" ? Math.random() * 3 + 1 : Math.random() * 10 + 8;
        this.speedX = (Math.random() - 0.5) * (type === "spark" ? 6 : 2);
        this.speedY = (Math.random() - 0.5) * (type === "spark" ? 6 : 2);
        this.alpha = 1;
        this.type = type;

        if (type === "spark") {
            this.color = ["yellow", "orange", "white"][Math.floor(Math.random() * 3)];
            this.decay = 0.05;
        } else {
            this.color = "rgba(128,128,128,0.5)";
            this.decay = 0.01;
        }
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        if (this.type === "smoke") this.size += 0.1;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) particles.push(new Particle(x, y, "spark"));
    for (let i = 0; i < 10; i++) particles.push(new Particle(x, y, "smoke"));
}

export function updateParticles() {
    particles.forEach((p, i) => {
        p.update();
        if (p.alpha <= 0) particles.splice(i, 1);
    });
}

export function drawParticles() {
    particles.forEach(p => p.draw());
}
