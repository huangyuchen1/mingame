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
//手机页面操作
let touchStartX = null;
let touchStartY = null;
canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
    let currentX = e.touches[0].clientX;
    let currentY = e.touches[0].clientY;
    let diffX = currentX - touchStartX;
    let diffY = currentY - touchStartY;

    player.x += diffX;
    player.y += diffY;

    // 保证不超出边界
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    touchStartX = currentX;
    touchStartY = currentY;
});

canvas.addEventListener("touchend", () => {
    touchStartX = null;
    touchStartY = null;
})
// 玩家类
class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 6; // 可以适当调整
        this.dx = 0;
        this.dy = 0; // 增加垂直方向的速度
        this.image = new Image();
        this.image.src = "img-py/player-1.png";
        this.hp = 100;  // 玩家初始血量
        this.shootType = 0; // 射击模式编号  // 默认是三行并排射击
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        // 保证不超出边界
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;  // 不允许玩家超出上边界
        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;  // 不允许玩家超出下边界
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        // 绘制血条
        this.drawHealthBar();
    }
    drawHealthBar() {
        ctx.fillStyle = "red";
        ctx.fillRect(canvas.width - 200, 30, 180, 20);  // 背景
        ctx.fillStyle = "green";
        ctx.fillRect(canvas.width - 200, 30, (this.hp / 100) * 180, 20);  // 血条
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width - 200, 30, 180, 20);  // 血条边框
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
let boss = null;
let bossBullets = [];
let bossAppeared = false;

// Boss 类
class Boss {
    constructor() {
        this.width = 150;
        this.height = 150;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 50;
        this.speedX = 2;
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.image = new Image();
        this.image.src = "img-py/boss-1.png"; // 需要准备一张 Boss 图片
        this.lastShootTime = 0;
    }

    move() {
        this.x += this.speedX;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.speedX *= -1; // 碰到边界反向
        }
    }

    shoot() {
        let now = performance.now();
        if (now - this.lastShootTime > 1000) { // 每 1 秒发射一波
            for (let i = 0; i < 5; i++) {
                let angle = Math.PI / 4 + (Math.random() - 0.5) * Math.PI / 2;
                bossBullets.push(new Bullet(
                    this.x + this.width / 2,
                    this.y + this.height,
                    Math.cos(angle) * 3,
                    Math.sin(angle) * 3
                ));
            }
            this.lastShootTime = now;
        }
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

        // Boss 血条
        let barWidth = 400;
        let barHeight = 20;
        let barX = canvas.width / 2 - barWidth / 2;
        let barY = 20;
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "lime";
        ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barWidth, barHeight);
        ctx.strokeStyle = "black";
        ctx.strokeRect(barX, barY, barWidth, barHeight);
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
    updateShootType();
    player.move();
    // Boss 出现逻辑
    if (score >= 30 && !bossAppeared) {
        boss = new Boss();
        bossAppeared = true;
        enemies = []; // 清空小怪
    }
    if (boss) {
        boss.move();
        boss.shoot();

        // 检测玩家子弹打 Boss
        bullets.forEach((bullet, bi) => {
            if (
                bullet.x < boss.x + boss.width &&
                bullet.x + bullet.width > boss.x &&
                bullet.y < boss.y + boss.height &&
                bullet.y + bullet.height > boss.y
            ) {
                boss.hp -= 1;
                bullets.splice(bi, 1);

                if (boss.hp <= 0) {
                    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2);
                    boss = null;
                    bossAppeared = false;
                    // TODO: 这里可以设置游戏胜利逻辑
                }
            }
        });

        // 检测 Boss 子弹打到玩家
        bossBullets.forEach((b, i) => {
            b.move();
            if (
                b.x < player.x + player.width &&
                b.x + b.width > player.x &&
                b.y < player.y + player.height &&
                b.y + b.height > player.y
            ) {
                player.hp -= 10;
                bossBullets.splice(i, 1);
                if (player.hp <= 0) gameOver = true;
            }
            // 超出屏幕移除
            if (b.y > canvas.height || b.x < 0 || b.x > canvas.width) {
                bossBullets.splice(i, 1);
            }
        });
    } else {
        // 没有 Boss 才生成普通小怪
        if (Math.random() < 0.02) enemies.push(new Enemy());
    }
    // 控制射击类型
    let now = performance.now();
    if (now - lastShootTime > 150) {
        shootByType(player.shootType);
        lastShootTime = now;
    }

    bullets.forEach((bullet, i) => {
        bullet.move();
        if (bullet.y < 0) bullets.splice(i, 1);
    });


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

        enemies.forEach((enemy, index) => {
            if (
                player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y
            ) {
                player.hp -= 10;
                enemies.splice(index, 1);
                if (player.hp <= 0) {
                    gameOver = true;
                }
            }
        });
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
        if (boss) {
            boss.draw();
            bossBullets.forEach(b => b.draw());
        }
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
    console.log("检测到按键触发"+e.key);
    if (e.key === "a") player.dx = -player.speed;
    if (e.key === "d") player.dx = player.speed;
    if (e.key === "w") player.dy = -player.speed; // 向上移动
    if (e.key === "s") player.dy = player.speed; // 向下移动
    if (e.key === "r" || e.key === "R") {
        if (gameOver) {
            init();
        }
    }
});
document.addEventListener("keyup", (e) => {
    if (e.key === "a" || e.key === "d") player.dx = 0;
    if (e.key === "w" || e.key === "s") player.dy = 0; // 停止垂直方向移动
});
function updateShootType() {
    if (score >= 25) player.shootType = 5; // 双层三排
    else if (score >= 20) player.shootType = 4; // 环形
    else if (score >= 15) player.shootType = 3; // 五连散射
    else if (score >= 10) player.shootType = 2; // 三排
    else if (score >= 5) player.shootType = 1; // 双排
    else player.shootType = 0; // 单排
}
function shootByType(type) {
    const cx = player.x + player.width / 2 - 2;
    const cy = player.y;

    if (type === 0) {
        bullets.push(new Bullet(cx, cy));
    }
    else if (type === 1) {
        bullets.push(new Bullet(cx - 10, cy));
        bullets.push(new Bullet(cx + 10, cy));
    }
    else if (type === 2) {
        bullets.push(new Bullet(cx - 20, cy));
        bullets.push(new Bullet(cx, cy));
        bullets.push(new Bullet(cx + 20, cy));
    }
    else if (type === 3) {
        bullets.push(new Bullet(cx, cy));
        bullets.push(new Bullet(cx - 20, cy, -2, -5));
        bullets.push(new Bullet(cx + 20, cy, 2, -5));
        bullets.push(new Bullet(cx - 40, cy, -3, -4));
        bullets.push(new Bullet(cx + 40, cy, 3, -4));
    }
    else if (type === 4) {
        for (let i = 0; i < 12; i++) {
            let angle = (Math.PI * 2 / 12) * i;
            bullets.push(new Bullet(cx, cy, Math.cos(angle) * 4, Math.sin(angle) * 4));
        }
    }
    else if (type === 5) {
        // 上层
        bullets.push(new Bullet(cx - 20, cy));
        bullets.push(new Bullet(cx, cy));
        bullets.push(new Bullet(cx + 20, cy));
        // 下层
        bullets.push(new Bullet(cx - 20, cy - 15));
        bullets.push(new Bullet(cx, cy - 15));
        bullets.push(new Bullet(cx + 20, cy - 15));
    }
}
init();
