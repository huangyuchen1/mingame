import { player, initGame, gameLoop, gamePaused, gameStarted, startGame, gameOver } from "./game.js";
import { audioManager } from "./audio.js";

export function setupInput() {
    // 键盘控制
    document.addEventListener("keydown", (e) => {
        if (!gameStarted || gameOver) {
            if (e.code === "Space") {
                if (!gameStarted) {
                    startGame();
                } else {
                    initGame();
                    gameLoop();
                }
            }
            return;
        }
        
        if (gamePaused) {
            if (e.key === "p" || e.key === "P") {
                gamePaused = false;
            } else if (e.key === "r" || e.key === "R") {
                initGame();
                gameLoop();
            }
            return;
        }
        
        // 移动控制
        if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
            player.dx = -player.speed;
        }
        if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
            player.dx = player.speed;
        }
        if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
            player.dy = -player.speed;
        }
        if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
            player.dy = player.speed;
        }
        
        // 游戏控制
        if (e.key === "p" || e.key === "P") {
            gamePaused = true;
        }
        if (e.key === "r" || e.key === "R") {
            initGame();
            gameLoop();
        }
        if (e.key === "m" || e.key === "M") {
            audioManager.toggleMusic();
        }
        if (e.key === "s" || e.key === "S") {
            audioManager.toggleSound();
        }
        
        // 防止按键默认行为
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e) => {
        if (["a", "A", "d", "D", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            player.dx = 0;
        }
        if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(e.key)) {
            player.dy = 0;
        }
    });

    // 改进的触摸控制
    let touchStartX = null, touchStartY = null;
    let touchMoveX = null, touchMoveY = null;
    let isTouching = false;
    const canvas = document.getElementById("gameCanvas");

    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchMoveX = touch.clientX;
        touchMoveY = touch.clientY;
        isTouching = true;
    });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (!isTouching || !gameStarted || gamePaused || gameOver) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchMoveX;
        const deltaY = touch.clientY - touchMoveY;
        
        // 平滑移动，避免跳跃
        player.x += deltaX * 0.8;
        player.y += deltaY * 0.8;
        
        // 边界检查
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
        
        touchMoveX = touch.clientX;
        touchMoveY = touch.clientY;
    });

    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        isTouching = false;
        touchStartX = null;
        touchStartY = null;
        touchMoveX = null;
        touchMoveY = null;
    });

    // 鼠标控制（可选）
    let isMouseDown = false;
    let lastMouseX = 0, lastMouseY = 0;

    canvas.addEventListener("mousedown", (e) => {
        if (!gameStarted || gamePaused || gameOver) return;
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isMouseDown || !gameStarted || gamePaused || gameOver) return;
        
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        player.x += deltaX;
        player.y += deltaY;
        
        // 边界检查
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    canvas.addEventListener("mouseup", () => {
        isMouseDown = false;
    });

    // 窗口大小改变时重新调整画布
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // 重新定位玩家到屏幕中央
        if (player) {
            player.x = canvas.width / 2 - player.width / 2;
            player.y = canvas.height - player.height - 10;
        }
    });
}
