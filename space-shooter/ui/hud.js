import { ctx, canvas } from "../core/game.js";

export function drawHUD(score, time, hp) {
    // 计算难度等级
    const difficulty = Math.min(Math.floor(score / 50) + 1, 5);
    const weaponLevel = Math.min(Math.floor(score / 20) + 1, 6);
    
    // 背景面板
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 300, 120);
    ctx.fillRect(canvas.width - 310, 10, 300, 120);
    
    // 边框
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 120);
    ctx.strokeRect(canvas.width - 310, 10, 300, 120);
    
    // 左侧信息
    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 20px Arial";
    ctx.fillText("得分", 20, 35);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.fillText(`${score}`, 20, 60);
    
    ctx.fillStyle = "#00ff00";
    ctx.font = "16px Arial";
    ctx.fillText(`生存时间: ${Math.floor(time)}s`, 20, 85);
    
    ctx.fillStyle = "#ffff00";
    ctx.font = "14px Arial";
    ctx.fillText(`难度等级: ${difficulty}`, 20, 105);
    ctx.fillText(`武器等级: ${weaponLevel}`, 20, 125);
    
    // 右侧信息 - 血条
    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 20px Arial";
    ctx.fillText("生命值", canvas.width - 300, 35);
    
    // 血条背景
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(canvas.width - 300, 45, 280, 20);
    
    // 血条
    const hpPercentage = hp / 100;
    if (hpPercentage > 0.6) {
        ctx.fillStyle = "#00ff00";
    } else if (hpPercentage > 0.3) {
        ctx.fillStyle = "#ffff00";
    } else {
        ctx.fillStyle = "#ff0000";
    }
    ctx.fillRect(canvas.width - 300, 45, hpPercentage * 280, 20);
    
    // 血条边框
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 300, 45, 280, 20);
    
    // 血量数值
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText(`${hp}/100`, canvas.width - 200, 60);
    
    // 控制提示
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px Arial";
    ctx.fillText("WASD/方向键: 移动", canvas.width - 300, 85);
    ctx.fillText("P: 暂停  R: 重新开始", canvas.width - 300, 100);
    ctx.fillText("M: 音乐开关  S: 音效开关", canvas.width - 300, 115);
    
    // 屏幕中央的连击提示（如果有的话）
    if (score > 0 && score % 10 === 0) {
        ctx.fillStyle = "rgba(255, 255, 0, 0.8)";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`连击! +${score}`, canvas.width / 2, canvas.height / 2 - 100);
        ctx.textAlign = "left";
    }
    
    // 武器升级提示
    if (weaponLevel > 1) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.8)";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`武器已升级! 等级: ${weaponLevel}`, canvas.width / 2, 50);
        ctx.textAlign = "left";
    }
}
