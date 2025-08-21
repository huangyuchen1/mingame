function cpuController(self, enemy) {
// 简单 AI: 追玩家
    const dist = enemy.centerX - self.centerX;
    if (Math.abs(dist) > 100) {
        self.vx = Math.sign(dist) * 2;
    } else {
        self.vx = 0;
    }
}