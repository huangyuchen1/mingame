import { canvas, ctx } from "../core/game.js";
import { bullets, Bullet } from "./bullet.js";
import { playShootSound } from "../core/audio.js";

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
        this.maxHp = 100;
        this.shield = 0;
        this.maxShield = 50;
        this.shootType = 0; // 武器等级
        this.lastShootTime = 0;
        this.specialCooldown = 0;
        this.specialDuration = 0;
        this.isInvincible = false;
        this.invincibleTime = 0;
        this.combo = 0;
        this.lastKillTime = 0;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
    }

    update() {
        // 更新无敌时间
        if (this.isInvincible) {
            this.invincibleTime -= 1/60;
            if (this.invincibleTime <= 0) {
                this.isInvincible = false;
            }
        }
        
        // 更新特殊技能冷却
        if (this.specialCooldown > 0) {
            this.specialCooldown -= 1/60;
        }
        
        // 更新特殊技能持续时间
        if (this.specialDuration > 0) {
            this.specialDuration -= 1/60;
            if (this.specialDuration <= 0) {
                this.shootType = Math.max(0, this.shootType - 1);
            }
        }
        
        // 更新连击
        if (performance.now() - this.lastKillTime > 3000) {
            this.combo = 0;
        }
    }

    draw() {
        // 无敌状态闪烁效果
        if (this.isInvincible && Math.floor(this.invincibleTime * 10) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        // 绘制护盾效果
        if (this.shield > 0) {
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                   this.width/2 + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        // 特殊技能激活效果
        if (this.specialDuration > 0) {
            ctx.strokeStyle = "#ff00ff";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 
                   this.width/2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        
        ctx.globalAlpha = 1;
    }

    takeDamage(damage) {
        if (this.isInvincible) return;
        
        // 护盾优先吸收伤害
        if (this.shield > 0) {
            if (this.shield >= damage) {
                this.shield -= damage;
                damage = 0;
            } else {
                damage -= this.shield;
                this.shield = 0;
            }
        }
        
        if (damage > 0) {
            this.hp -= damage;
            this.isInvincible = true;
            this.invincibleTime = 1.5; // 1.5秒无敌时间
        }
    }

    addShield(amount) {
        this.shield = Math.min(this.maxShield, this.shield + amount);
    }

    activateSpecial() {
        if (this.specialCooldown <= 0) {
            this.shootType = Math.min(5, this.shootType + 2);
            this.specialDuration = 10; // 10秒持续时间
            this.specialCooldown = 30; // 30秒冷却时间
        }
    }

    addCombo() {
        this.combo++;
        this.lastKillTime = performance.now();
    }

    autoShoot() {
        let now = performance.now();
        let shootInterval = 150;
        
        // 根据连击数减少射击间隔
        if (this.combo > 5) {
            shootInterval = Math.max(50, 150 - this.combo * 10);
        }
        
        if (now - this.lastShootTime > shootInterval) {
            this.shoot();
            this.lastShootTime = now;
        }
    }

    shoot() {
        const cx = this.x + this.width / 2 - 2;
        const cy = this.y;
        
        playShootSound();

        switch (this.shootType) {
            case 0: // 基础单发
                bullets.push(new Bullet(cx, cy));
                break;
            case 1: // 双发
                bullets.push(new Bullet(cx - 10, cy));
                bullets.push(new Bullet(cx + 10, cy));
                break;
            case 2: // 三发
                bullets.push(new Bullet(cx - 20, cy));
                bullets.push(new Bullet(cx, cy));
                bullets.push(new Bullet(cx + 20, cy));
                break;
            case 3: // 散射
                bullets.push(new Bullet(cx, cy));
                bullets.push(new Bullet(cx - 20, cy, -2, -5));
                bullets.push(new Bullet(cx + 20, cy, 2, -5));
                bullets.push(new Bullet(cx - 40, cy, -3, -4));
                bullets.push(new Bullet(cx + 40, cy, 3, -4));
                break;
            case 4: // 环形射击
                for (let i = 0; i < 12; i++) {
                    let angle = (Math.PI * 2 / 12) * i;
                    bullets.push(new Bullet(cx, cy, Math.cos(angle) * 4, Math.sin(angle) * 4));
                }
                break;
            case 5: // 密集射击
                bullets.push(new Bullet(cx - 20, cy));
                bullets.push(new Bullet(cx, cy));
                bullets.push(new Bullet(cx + 20, cy));
                bullets.push(new Bullet(cx - 20, cy - 15));
                bullets.push(new Bullet(cx, cy - 15));
                bullets.push(new Bullet(cx + 20, cy - 15));
                break;
            case 6: // 超级武器
                for (let i = 0; i < 8; i++) {
                    let angle = (Math.PI * 2 / 8) * i;
                    bullets.push(new Bullet(cx, cy, Math.cos(angle) * 6, Math.sin(angle) * 6));
                }
                bullets.push(new Bullet(cx, cy, 0, -8));
                bullets.push(new Bullet(cx - 15, cy, -1, -7));
                bullets.push(new Bullet(cx + 15, cy, 1, -7));
                break;
        }
    }

    upgradeWeapon() {
        if (this.shootType < 6) {
            this.shootType++;
            // 升级时恢复一些血量
            this.hp = Math.min(this.maxHp, this.hp + 20);
        }
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }
}
