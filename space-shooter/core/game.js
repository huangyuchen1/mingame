import { Player } from "../entities/player.js";
import { Enemy } from "../entities/enemy.js";
import { Boss } from "../entities/boss.js";
import { PowerUp } from "../entities/powerup.js";
import { bullets, updateBullets, drawBullets } from "../entities/bullet.js";
import { particles, updateParticles, drawParticles } from "../entities/particle.js";
import { drawBackground, updateBackground } from "./background.js";
import { drawHUD } from "../ui/hud.js";
import { checkCollision } from "./collision.js";

export let canvas, ctx;
export let player;
export let enemies = [];
export let boss = null;
export let score = 0;
export let gameOver = false;
export let timeElapsed = 0;
export let powerUps = [];

export function initGame() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player = new Player();
    enemies = [];
    boss = null;
    bullets.length = 0;
    particles.length = 0;
    powerUps.length = 0;
    score = 0;
    gameOver = false;
    timeElapsed = 0;
}

export function gameLoop() {
    if (!gameOver) {
        updateBackground();
        update();
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "48px Arial";
        ctx.fillText("💀 游戏失败 💀", canvas.width / 2, canvas.height / 2 - 100);

        ctx.font = "28px Arial";
        ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillText(`生存时间: ${timeElapsed.toFixed(1)} 秒`, canvas.width / 2, canvas.height / 2 + 10);

        ctx.font = "24px Arial";
        ctx.fillText("按 R 键重新开始", canvas.width / 2, canvas.height / 2 + 60);    }
}

function update() {
    timeElapsed += 1 / 60;

    if (!boss && score >= 30) {
        boss = new Boss();
        enemies.length = 0;
    }

    player.move();
    player.autoShoot();

    updateBullets();
    updateParticles();

    if (!boss && Math.random() < 0.02) enemies.push(new Enemy());

    enemies.forEach((enemy, ei) => {
        enemy.move();
        if (enemy.y > canvas.height) enemies.splice(ei, 1);

        bullets.forEach((bullet, bi) => {
            if (checkCollision(bullet, enemy)) {
                enemy.hp -= 1;
                bullets.splice(bi, 1);
                if (enemy.hp <= 0) {
                    enemy.onDestroy();
                    enemies.splice(ei, 1);
                    score++;
                    if (Math.random() < 0.1) powerUps.push(new PowerUp(enemy.x, enemy.y));
                }
            }
        });

        if (checkCollision(player, enemy)) {
            player.hp -= 10;
            enemies.splice(ei, 1);
            if (player.hp <= 0) gameOver = true;
        }
    });
    //boss游戏逻辑
    if (boss) {
        boss.update();
        bullets.forEach((bullet, bi) => {
            if (checkCollision(bullet, boss)) {
                boss.hp--;
                bullets.splice(bi, 1);
                if (boss.hp <= 0) {
                    boss.onDestroy();
                    score += 10;
                    powerUps.push(new PowerUp(boss.x, boss.y));
                    boss = null;
                }
            }
        });
        boss.bullets.forEach((b, i) => {
            b.move();
            if (boss && checkCollision(player, b)) {
                player.hp -= 20;
                boss.bullets.splice(i, 1);
                if (player.hp <= 0) gameOver = true;
            }
        });
    }

    powerUps.forEach((p, pi) => {
        p.move();
        if (checkCollision(player, p)) {
            player.upgradeWeapon();
            powerUps.splice(pi, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    player.draw();
    drawBullets();
    enemies.forEach(e => e.draw());
    if (boss) {
        boss.draw();
        boss.drawHPBar();
    }
    drawParticles();
    powerUps.forEach(p => p.draw());

    drawHUD(score, timeElapsed, player.hp);
}
