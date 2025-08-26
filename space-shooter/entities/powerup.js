import { canvas, ctx } from "../core/game.js";
import { player } from "../core/game.js";

export class PowerUp {
    constructor(x, y, type = null) {
        this.width = 30;
        this.height = 30;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.type = type || Math.floor(Math.random() * 4); // 0:武器升级, 1:护盾, 2:治疗, 3:特殊技能
        this.image = new Image();
        this.image.src = "img/powerup.png";
        this.rotation = 0;
        this.pulse = 0;
    }

    move() {
        this.y += this.speed;
        this.rotation += 0.1;
        this.pulse += 0.2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // 根据类型设置颜色
        const colors = ["#ffff00", "#00ffff", "#00ff00", "#ff00ff"];
        const color = colors[this.type];
        
        // 脉冲效果
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);
        
        // 绘制道具图标
        ctx.fillStyle = color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // 绘制道具符号
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        const symbols = ["⚡", "🛡️", "❤️", "🔥"];
        ctx.fillText(symbols[this.type], 0, 5);
        
        ctx.restore();
    }

    applyEffect() {
        switch (this.type) {
            case 0: // 武器升级
                player.upgradeWeapon();
                break;
            case 1: // 护盾
                player.addShield(30);
                break;
            case 2: // 治疗
                player.heal(50);
                break;
            case 3: // 特殊技能
                player.activateSpecial();
                break;
        }
    }
}
