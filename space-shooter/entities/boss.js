import { canvas, ctx, player } from "../core/game.js";
import { Bullet } from "./bullet.js";

export class Boss {
    constructor() {
        this.width = 150;
        this.height = 150;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 50;
        this.hp = 150;
        this.maxHp = 150;
        this.bullets = [];
        this.image = new Image();
        this.image.src = "img/boss-1.png";
        this.lastShootTime = 0;
        this.attackPattern = 0;
        this.patternTimer = 0;
        this.moveDirection = 1;
        this.moveSpeed = 2;
        this.phase = 1;
        this.lastPhaseChange = 0;
    }

    update() {
        this.patternTimer += 1/60;
        
        // 每10秒切换攻击模式
        if (this.patternTimer > 10) {
            this.attackPattern = (this.attackPattern + 1) % 4;
            this.patternTimer = 0;
        }
        
        // 根据血量切换阶段
        const hpPercentage = this.hp / this.maxHp;
        if (hpPercentage <= 0.5 && this.phase === 1) {
            this.phase = 2;
            this.moveSpeed = 3;
            this.lastPhaseChange = performance.now();
        } else if (hpPercentage <= 0.25 && this.phase === 2) {
            this.phase = 3;
            this.moveSpeed = 4;
            this.lastPhaseChange = performance.now();
        }
        
        // 移动
        this.move();
        
        // 射击
        let now = performance.now();
        let shootInterval = 500;
        
        // 根据阶段调整射击频率
        if (this.phase === 2) shootInterval = 400;
        if (this.phase === 3) shootInterval = 300;
        
        if (now - this.lastShootTime > shootInterval) {
            this.shoot();
            this.lastShootTime = now;
        }
        
        // 更新子弹
        this.bullets.forEach((b, i) => {
            b.move();
            if (b.y > canvas.height) this.bullets.splice(i, 1);
        });
    }

    move() {
        // 水平移动
        this.x += this.moveDirection * this.moveSpeed;
        
        // 边界检测
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.moveDirection *= -1;
        }
        
        // 垂直移动（跟随玩家）
        const targetY = Math.max(50, player.y - 200);
        if (this.y < targetY) {
            this.y += 1;
        } else if (this.y > targetY) {
            this.y -= 1;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(Math.PI); // 旋转180度
        
        // 根据阶段改变颜色
        if (this.phase === 2) {
            ctx.filter = "hue-rotate(60deg)";
        } else if (this.phase === 3) {
            ctx.filter = "hue-rotate(120deg) brightness(1.5)";
        }
        
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        this.bullets.forEach(b => b.draw());
    }

    drawHPBar() {
        const barWidth = 400;
        const barHeight = 20;
        const x = canvas.width / 2 - barWidth / 2;
        const y = 10;
        
        // 背景
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // 血条
        const hpPercentage = this.hp / this.maxHp;
        if (hpPercentage > 0.6) {
            ctx.fillStyle = "#00ff00";
        } else if (hpPercentage > 0.3) {
            ctx.fillStyle = "#ffff00";
        } else {
            ctx.fillStyle = "#ff0000";
        }
        ctx.fillRect(x, y, hpPercentage * barWidth, barHeight);
        
        // 边框
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // 阶段指示器
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`阶段 ${this.phase}`, canvas.width / 2, y + barHeight + 15);
        ctx.textAlign = "left";
    }

    shoot() {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height;
        
        switch (this.attackPattern) {
            case 0: // 直线射击
                for (let i = -2; i <= 2; i++) {
                    this.bullets.push(new Bullet(cx + i * 15, cy, i, 4));
                }
                break;
            case 1: // 扇形射击
                for (let i = -3; i <= 3; i++) {
                    const angle = (i * Math.PI / 6) - Math.PI / 2;
                    this.bullets.push(new Bullet(cx, cy, Math.cos(angle) * 4, Math.sin(angle) * 4));
                }
                break;
            case 2: // 追踪射击
                const dx = player.x - cx;
                const dy = player.y - cy;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    this.bullets.push(new Bullet(cx, cy, (dx / distance) * 3, (dy / distance) * 3));
                }
                break;
            case 3: // 环形射击
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 / 8) * i;
                    this.bullets.push(new Bullet(cx, cy, Math.cos(angle) * 3, Math.sin(angle) * 3));
                }
                break;
        }
        
        // 第三阶段额外攻击
        if (this.phase === 3) {
            for (let i = 0; i < 4; i++) {
                const angle = (Math.PI * 2 / 4) * i;
                this.bullets.push(new Bullet(cx, cy, Math.cos(angle) * 2, Math.sin(angle) * 2));
            }
        }
    }

    onDestroy() {
        // 可以加爆炸动画
        console.log("Boss被击败！");
    }
}
