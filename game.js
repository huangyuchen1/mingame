const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player;
let bullets = [];
let enemies = [];
let particles = [];
let score = 0;
let gameOver = false;
let timeElapsed = 0;
let lastShootTime = 0;
let shootInterval = 1;

// 背景
const bgImage = new Image();
bgImage.src = "img/space-bg.png";
let bgY1 = 0;
let bgY2 = -canvas.height;
let bgSpeed = 1.5;

// 玩家类
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 10;
        this.dx = 0;

        this.image = new Image();
        this.image.src = "img-py/player-1.png";
    }

    move() {
        this.x += this.dx;
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// 子弹类
class Bullet {
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

// 敌机类（带血条）
class Enemy {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 0.4 + Math.random() * 0.4; // 大约 0.4~0.8 像素/帧

        this.maxHp = 3;
        this.hp = this.maxHp;

        const imgIndex = Math.random() < 0.5 ? "enemy-1.png" : "enemy-2.png";
        this.image = new Image();
        this.image.src = `img-py/${imgIndex}`;
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        // 敌机
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.scale(1, -1);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        // 血条
        let barWidth = this.width;
        let barHeight = 4;
        let barX = this.x;
        let barY = this.y - 8;

        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "lime";
        ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barWidth, barHeight);
    }
}

// 粒子类
class Particle {
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

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) particles.push(new Particle(x, y, "spark"));
    for (let i = 0; i < 10; i++) particles.push(new Particle(x, y, "smoke"));
}

// 初始化
function init() {
    player = new Player();
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    gameOver = false;
    timeElapsed = 0;
    lastShootTime = 0;
    requestAnimationFrame(gameLoop);
}

// 背景滚动
function updateBackground() {
    bgY1 += bgSpeed;
    bgY2 += bgSpeed;
    if (bgY1 >= canvas.height) bgY1 = -canvas.height;
    if (bgY2 >= canvas.height) bgY2 = -canvas.height;
}

// 更新逻辑
function update() {
    timeElapsed += 1 / 60;

    // 敌人加速
    enemies.forEach(enemy => {
        enemy.speed += 0.01 * (1 / 60);
    });

    player.move();

    // 三向自动射击
    let now = performance.now();
    if (now - lastShootTime > 150) {
        const cx = player.x + player.width / 2 - 2;
        const cy = player.y;
        bullets.push(new Bullet(cx, cy));
        bullets.push(new Bullet(cx, cy, -4, -4));
        bullets.push(new Bullet(cx, cy, 4, -4));
        lastShootTime = now;
    }

    bullets.forEach((bullet, i) => {
        bullet.move();
        if (bullet.y < 0) bullets.splice(i, 1);
    });

    if (Math.random() < 0.02) enemies.push(new Enemy());

    enemies.forEach((enemy, ei) => {
        enemy.move();

        if (enemy.y > canvas.height) enemies.splice(ei, 1);

        bullets.forEach((bullet, bi) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                enemy.hp -= 1;
                bullets.splice(bi, 1);

                if (enemy.hp <= 0) {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    enemies.splice(ei, 1);
                    score++;
                }
            }
        });

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver = true;
        }
    });

    particles.forEach((p, i) => {
        p.update();
        if (p.alpha <= 0) particles.splice(i, 1);
    });
}

// 绘制背景
function drawBackground() {
    ctx.drawImage(bgImage, 0, bgY1, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, bgY2, canvas.width, canvas.height);
}

// 绘制
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.fillText("游戏失败", canvas.width / 2 - 100, canvas.height / 2 - 50);
        ctx.font = "24px Arial";
        ctx.fillText("按 R 键重新开始", canvas.width / 2 - 110, canvas.height / 2 + 20);
    } else {
        drawBackground();
        player.draw();
        bullets.forEach(b => b.draw());
        enemies.forEach(e => e.draw());
        particles.forEach(p => p.draw());

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Survival Time: ${Math.floor(timeElapsed)}s`, canvas.width - 220, 30);
    }
}

// 游戏循环
function gameLoop() {
    if (!gameOver) {
        updateBackground();
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// 控制
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
    if (e.key === "r" || e.key === "R") {
        if (gameOver) init();
    }
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

init();
