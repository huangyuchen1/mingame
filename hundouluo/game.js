// ======= 工具 =======
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const rand = (a,b)=>a+Math.random()*(b-a);
const now = ()=>performance.now();

// ======= 画布 & 上下文 =======
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// ======= UI 元素 =======
const elHome = document.getElementById('home');
const elBtnStart = document.getElementById('btnStart');
const elBtnReset = document.getElementById('btnReset');
const elBtnPause = document.getElementById('btnPause');
const elHomeStart = document.getElementById('homeStart');
const elHomeHow = document.getElementById('homeHow');
const elHomeCredits = document.getElementById('homeCredits');
const elPauseOverlay = document.getElementById('pauseOverlay');
const elBtnResume = document.getElementById('btnResume');
const tagLives = document.getElementById('tagLives');
const tagWeapon = document.getElementById('tagWeapon');
const tagScore = document.getElementById('tagScore');
const tagTime = document.getElementById('tagTime');
const toast = document.getElementById('toast');

function showToast(msg, ms=1500){
    toast.textContent = msg; toast.style.display='block';
    clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.style.display='none', ms);
}

// ======= 输入 =======
const keys = new Set();
const hold = k=>keys.has(k);
window.addEventListener('keydown',e=>{ keys.add(e.key.toLowerCase()); if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) keys.add(e.key); if(e.key===' '){ e.preventDefault(); keys.add(' ');} });
window.addEventListener('keyup',e=>{ keys.delete(e.key.toLowerCase()); keys.delete(e.key); if(e.key===' ') keys.delete(' '); });

// ======= 世界参数 =======
const GRAVITY = 2100; // px/s^2
const FRICTION_GROUND = 0.85;
const RUN_SPEED = 420; // px/s
const JUMP_V = 830; // jump velocity
const BULLET_SPEED = 900;
const ENEMY_BULLET_SPEED = 520;
const TILE = 64; // tile size

// 摄像机
const camera = {x:0,y:0, lerp:0.12};

// 关卡：简单块平台 + 陷阱 + 终点 + Boss 区域
// 使用简化的对象数组： {x,y,w,h,type}
const platforms = [];
const enemies = [];
const pickups = [];
const bullets = []; // 玩家子弹
const eBullets = []; // 敌人子弹

let gameStarted=false, paused=false, gameOver=false, victory=false;
let score=0, timeStart=0, elapsed=0;

const player = {
    x: 120, y: 0, w: 38, h: 54,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    lives: 3,
    invul: 0,
    weapon: 'pea', // 'pea' | 'spread'
    shootCd: 0,
    respawn: {x:120,y:-100}
};

const boss = {
    active:false, x: 0, y: 0, w: 140, h: 140, hp: 160, phase: 0, fireCd: 0
};

function resetGame(){
    gameStarted=true; paused=false; gameOver=false; victory=false;
    score=0; elapsed=0; timeStart=now();
    player.x=120;  player.y=-100; player.vx=0; player.vy=0; player.lives=3; player.invul=0; player.weapon='pea'; player.shootCd=0; player.respawn={x:120,y:-100};
    boss.active=false; boss.hp=160; boss.phase=0; boss.fireCd=1;
    bullets.length=0; eBullets.length=0; platforms.length=0; enemies.length=0; pickups.length=0;
    buildLevel();
    elHome.style.display='none';
    elPauseOverlay.style.display='none';
    updateHud();
}

// ======= 关卡生成 =======
function addPlatform(x,y,w,h,type='solid'){ platforms.push({x,y,w,h,type}); }
function addEnemy(x,y,type='grunt'){ enemies.push(makeEnemy(x,y,type)); }
function addPickup(x,y,type='spread'){ pickups.push({x,y,w:28,h:20,type,vy:0,phase:rand(0,6.28)}); }

function buildLevel(){
    // 地面与台阶
    for(let i=0;i<80;i++) addPlatform(i*TILE, 520, TILE, 200, 'ground');
    // 一些跳台
    addPlatform(8*TILE, 420, TILE*2, 24);
    addPlatform(13*TILE, 380, TILE*2, 24);
    addPlatform(18*TILE, 340, TILE*2, 24);
    addPlatform(24*TILE, 380, TILE*2, 24);
    addPlatform(29*TILE, 420, TILE*2, 24);
    addPickup(30*TILE+20, 380-26, 'spread');

    // 敌人区域 1
    for(let i=12;i<20;i+=2) addEnemy(i*TILE+20, 520-54, 'grunt');
    for(let i=24;i<31;i+=2) addEnemy(i*TILE+20, 520-54, 'grunt');
    addEnemy(26*TILE+30, 520-54, 'gunner');

    // 敌人区域 2 + 陷阱
    addPlatform(36*TILE, 480, TILE*3, 24, 'spikes');
    addEnemy(35*TILE+20, 520-54, 'gunner');
    addEnemy(39*TILE+20, 520-54, 'gunner');

    // Boss 房间入口（门）
    addPlatform(45*TILE, 520-140, 12, 140, 'gate');
    addPlatform(45*TILE+12, 520-140, TILE*2, 12, 'ceiling');

    // Boss 房间地面
    for(let i=46;i<58;i++) addPlatform(i*TILE, 520, TILE, 200, 'ground');

    // Boss 出现位置
    boss.x = 52*TILE; boss.y = 520-140; boss.active=false; boss.hp=160; boss.phase=0;
}

function makeEnemy(x,y,type){
    return {
        x, y, w: 36, h: 52, vx: (Math.random()<.5?-1:1)*120, vy:0,
        type, hp: (type==='gunner'?3:2), shootCd: rand(0.6,1.6), alive:true, onGround:false
    };
}

// ======= 渲染 =======
function drawRect(x,y,w,h, color){ ctx.fillStyle=color; ctx.fillRect(Math.floor(x-camera.x), Math.floor(y-camera.y), Math.floor(w), Math.floor(h)); }
function drawText(t,x,y,size=16,align='left'){ ctx.fillStyle='#dde'; ctx.font = `bold ${size}px ui-sans-serif`; ctx.textAlign=align; ctx.fillText(t, x-camera.x, y-camera.y); }

function drawBackground(){
    // 简易视差背景
    const skyGrad = ctx.createLinearGradient(0,0,0,H);
    skyGrad.addColorStop(0,'#091225'); skyGrad.addColorStop(1,'#05080f');
    ctx.fillStyle = skyGrad; ctx.fillRect(0,0,W,H);
    // 远山层
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#1a2744';
    for(let i=0;i<10;i++){
        const bx = - (camera.x*0.2 % (W+300)) + i*300 - 200; const by=H-220;
        ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+120,by-90); ctx.lineTo(bx+240,by); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawWorld(){
    // 平台
    platforms.forEach(p=>{
        let c = '#2a334d';
        if(p.type==='spikes') c='#6e1b2a';
        if(p.type==='gate') c='#395b9a';
        if(p.type==='ceiling') c='#2d3b63';
        drawRect(p.x, p.y, p.w, p.h, c);
        if(p.type==='spikes'){
            // 画尖刺
            ctx.fillStyle='#b33';
            for(let i=0;i<p.w;i+=12){
                ctx.beginPath();
                ctx.moveTo(p.x - camera.x + i, p.y - camera.y);
                ctx.lineTo(p.x - camera.x + i+6, p.y - camera.y - 10);
                ctx.lineTo(p.x - camera.x + i+12, p.y - camera.y);
                ctx.fill();
            }
        }
    });

    // 拾取物
    pickups.forEach(pk=>{
        const t = (performance.now()/500)+pk.phase; const bob = Math.sin(t)*4;
        drawRect(pk.x, pk.y + bob, pk.w, pk.h, pk.type==='spread'?'#5dd3':'#6cf');
    })

    // 敌人
    enemies.forEach(e=>{
        if(!e.alive) return;
        const col = e.type==='gunner'?'#d8b45f':'#d36c6c';
        drawRect(e.x, e.y, e.w, e.h, col);
    })

    // Boss
    if(boss.active){
        drawRect(boss.x, boss.y, boss.w, boss.h, '#8a3ef2');
        // Boss 血条
        const bx = boss.x - camera.x + boss.w/2, by = boss.y - camera.y - 16;
        ctx.fillStyle="#222"; ctx.fillRect(bx-70, by, 140, 8);
        ctx.fillStyle="#9d6bff"; ctx.fillRect(bx-70, by, clamp(140*boss.hp/160,0,140), 8);
    }

    // 子弹
    ctx.fillStyle = '#9ce3ff';
    bullets.forEach(b=>{ ctx.fillRect(b.x - camera.x, b.y - camera.y, 6, 3); });
    ctx.fillStyle = '#ffb39c';
    eBullets.forEach(b=>{ ctx.fillRect(b.x - camera.x, b.y - camera.y, 6, 3); });

    // 玩家
    if(player.invul>0 && Math.floor(player.invul*10)%2===0) ctx.globalAlpha=0.35;
    drawRect(player.x, player.y, player.w, player.h, '#6cd36c');
    ctx.globalAlpha=1;
}

// ======= 碰撞 =======
function aabb(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

function resolvePlatform(entity){
    entity.onGround = false;
    for(const p of platforms){
        if(p.type==='ceiling' && entity.vy<0 && aabb(entity,{x:p.x,y:p.y,pw:p.w,h:p.h,w:p.w})){
            entity.y = p.y + p.h; entity.vy = 0; continue;
        }
        if(!aabb(entity, p)) continue;
        // 仅处理 solid/ground/spikes/gate 顶面落地
        if(entity.vy>0 && entity.y+entity.h - p.y < 24){
            entity.y = p.y - entity.h; entity.vy=0; entity.onGround=true;
            if(p.type==='spikes') hurt(entity, 1);
            if(p.type==='gate' && entity===player && !boss.active){ // 打开 Boss
                showToast('Boss 出现！'); boss.active=true; boss.hp=160; boss.phase=0; boss.fireCd=1.2;
            }
        } else if(entity.vy<0 && p.type!=='ground'){
            // 碰到平台底部
            entity.y = p.y + p.h; entity.vy = 0;
        } else {
            // 左右
            if(entity.vx>0) entity.x = p.x - entity.w;
            if(entity.vx<0) entity.x = p.x + p.w;
            entity.vx=0;
        }
    }
}

function hurt(entity, dmg){
    if(entity===player){
        if(player.invul>0) return;
        player.lives--; player.invul=1.2; showToast('受伤 -1 生命', 800);
        if(player.lives<=0){ gameOver=true; }
        else respawnPlayer();
    } else {
        entity.hp -= dmg; if(entity.hp<=0){ entity.alive=false; score+=100; }
    }
}

function respawnPlayer(){
    player.x = player.respawn.x; player.y = player.respawn.y; player.vx=0; player.vy=0;
}

// ======= 逻辑更新 =======
function update(dt){
    if(!gameStarted || paused) return;

    elapsed = (now()-timeStart)/1000;
    if(player.invul>0) player.invul = Math.max(0, player.invul - dt);

    // 输入移动
    const left = hold('a') || hold('arrowleft');
    const right = hold('d') || hold('arrowright');
    const up = hold('w') || hold('arrowup');
    const down = hold('s') || hold('arrowdown');
    const jumpPressed = hold('z') || hold('k') || hold(' ');
    const shootPressed = hold('x') || hold('j');

    let dir = 0; if(left) dir-=1; if(right) dir+=1;
    player.vx = dir*RUN_SPEED;
    if(dir!==0) player.facing = dir;

    if(jumpPressed && player.onGround){ player.vy = -JUMP_V; player.onGround=false; }

    // 重力
    player.vy += GRAVITY*dt; player.vy = Math.min(player.vy, 1600);

    // 位置更新
    player.x += player.vx*dt; player.y += player.vy*dt;

    // 碰撞平台
    resolvePlatform(player);

    // 掉出世界
    if(player.y>H+400){ hurt(player, 1); }

    // 设置复活点（前进即更新）
    if(player.x > player.respawn.x+120) player.respawn = {x:player.x, y:player.y-120};

    // 射击
    if(player.shootCd>0) player.shootCd-=dt;
    if(shootPressed && player.shootCd<=0){
        firePlayer(up, down, dir);
        player.shootCd = (player.weapon==='spread'?0.16:0.22);
    }

    // 拾取
    for(let i=pickups.length-1;i>=0;i--){
        const pk = pickups[i];
        const a = {x:player.x, y:player.y, w:player.w, h:player.h};
        if(aabb(a, pk)){
            if(pk.type==='spread'){ player.weapon='spread'; showToast('获得武器：散弹'); }
            pickups.splice(i,1);
        }
    }

    // 敌人 AI
    for(const e of enemies){
        if(!e.alive) continue;
        // 简单步兵：来回巡逻，遇到边缘换向
        if(e.type==='grunt'){
            e.vy += GRAVITY*dt; e.y += e.vy*dt; e.x += e.vx*dt;
            // 简单地面检测：如果在空中，继续下落
            e.onGround=false;
            for(const p of platforms){
                if(!aabb(e,p)) continue;
                if(e.vy>0 && e.y+e.h - p.y < 20){ e.y=p.y-e.h; e.vy=0; e.onGround=true; }
                else if(e.vx>0) e.x=p.x-e.w; else if(e.vx<0) e.x=p.x+p.w;
            }
            // 随机换向
            if(Math.random()<0.003) e.vx*=-1;
            // 与玩家相撞
            if(aabb(e, player)) hurt(player,1);
        }
        // 枪手：原地射击
        if(e.type==='gunner'){
            e.shootCd -= dt;
            if(e.shootCd<=0){
                shootAtPlayer(e);
                e.shootCd = rand(0.9,1.6);
            }
        }
    }

    // 子弹移动与碰撞
    for(let i=bullets.length-1;i>=0;i--){
        const b = bullets[i]; b.x += b.vx*dt; b.y += b.vy*dt; b.life-=dt; if(b.life<=0){ bullets.splice(i,1); continue; }
        // 撞平台
        for(const p of platforms){ if(aabb({x:b.x,y:b.y,w:6,h:3}, p)){ bullets.splice(i,1); break; } }
        // 撞敌人
        for(const e of enemies){ if(!e.alive) continue; if(aabb({x:b.x,y:b.y,w:6,h:3}, e)){ bullets.splice(i,1); hurt(e, (player.weapon==='spread'?1:1)); break; } }
        // 撞 Boss
        if(boss.active){ if(aabb({x:b.x,y:b.y,w:6,h:3}, boss)){ bullets.splice(i,1); boss.hp-=1; if(boss.hp<=0){ boss.active=false; victory=true; score+=2000; } } }
    }

    for(let i=eBullets.length-1;i>=0;i--){
        const b = eBullets[i]; b.x += b.vx*dt; b.y += b.vy*dt; b.life-=dt; if(b.life<=0){ eBullets.splice(i,1); continue; }
        if(aabb({x:b.x,y:b.y,w:6,h:3}, player)) { eBullets.splice(i,1); hurt(player,1); }
        for(const p of platforms){ if(aabb({x:b.x,y:b.y,w:6,h:3}, p)){ eBullets.splice(i,1); break; } }
    }

    // Boss 逻辑
    if(boss.active){
        boss.fireCd -= dt;
        const dir = Math.sign(player.x - boss.x);
        boss.x += dir * 40 * dt;
        if(boss.fireCd<=0){ bossFire(); boss.fireCd = 0.4 + Math.max(0, boss.hp/160)*0.8; }
        // 与玩家碰撞
        if(aabb(boss, player)) hurt(player,1);
    }

    // 摄像机跟随
    const targetX = clamp(player.x - W*0.35, 0, 58*TILE - W + 200);
    camera.x += (targetX - camera.x) * camera.lerp;
    camera.y += ((player.y - H*0.45) - camera.y) * (camera.lerp*0.6);

    // HUD
    updateHud();

    if(gameOver || victory) paused=true;
}

function updateHud(){
    tagLives.textContent = `生命 x${player.lives}`;
    tagWeapon.textContent = `武器：${player.weapon==='spread'?'散弹':'单发'}`;
    tagScore.textContent = `得分：${score}`;
    tagTime.textContent = `时间：${elapsed.toFixed(1)}s`;
}

function shootAtPlayer(e){
    const cx = e.x + e.w/2, cy = e.y + e.h/2;
    const dx = (player.x+player.w/2) - cx, dy=(player.y+player.h/2) - cy;
    const len = Math.hypot(dx,dy)||1; const vx = dx/len * ENEMY_BULLET_SPEED; const vy = dy/len * ENEMY_BULLET_SPEED;
    eBullets.push({x:cx, y:cy, vx, vy, life:2.6});
}

function bossFire(){
    const cx = boss.x + boss.w/2, cy = boss.y + boss.h/2;
    const pattern = boss.hp>80?6:10; const speed = boss.hp>80?260:340;
    for(let i=0;i<pattern;i++){
        const a = (i/pattern)*Math.PI*2;
        eBullets.push({x:cx, y:cy, vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, life:2.8});
    }
}

function firePlayer(up,down,dir){
    // 八方向：根据上下与当前朝向组合
    const cx = player.x + player.w/2, cy = player.y + player.h/2;
    const spread = player.weapon==='spread' ? 3 : 1;
    let ax=0, ay=0;
    if(up && !down){ ay=-1; ax=dir!==0?dir*0.7:0; }
    else if(down && !up){ ay=1; ax=dir!==0?dir*0.6:0; }
    else { ay=0; ax=dir!==0?dir:player.facing; }
    if(ax===0 && ay===0){ ax = player.facing; }
    const base = Math.atan2(ay, ax);
    const step = spread===3 ? 0.2 : 0;
    for(let i=0;i<spread;i++){
        const angle = base + (i-(spread-1)/2)*step;
        const vx = Math.cos(angle)*BULLET_SPEED;
        const vy = Math.sin(angle)*BULLET_SPEED;
        bullets.push({x:cx, y:cy, vx, vy, life:0.9});
    }
}

// ======= 主循环 =======
let last = now();
function loop(){
    const t = now(); const dt = Math.min(0.033, (t-last)/1000); last = t;

    // 逻辑
    if(gameStarted && !paused){ update(dt); }

    // 渲染
    ctx.clearRect(0,0,W,H); drawBackground(); drawWorld();

    // 结束态覆盖
    if(gameOver){
        ctx.fillStyle="#fff"; ctx.font='bold 42px ui-sans-serif'; ctx.textAlign='center';
        ctx.fillText('你失败了', W/2, H/2 - 20);
        ctx.font='bold 20px ui-sans-serif'; ctx.fillText('按 R 重开', W/2, H/2 + 12);
    }
    if(victory){
        ctx.fillStyle="#fff"; ctx.font='bold 42px ui-sans-serif'; ctx.textAlign='center';
        ctx.fillText('胜利！', W/2, H/2 - 20);
        ctx.font='bold 20px ui-sans-serif'; ctx.fillText('击败 Boss，得分 +2000，按 R 重开', W/2, H/2 + 12);
    }

    requestAnimationFrame(loop);
}

// ======= 事件 & 控制 =======
function startGame(){ if(!gameStarted){ resetGame(); } else { elHome.style.display='none'; paused=false; } }
function togglePause(){ if(!gameStarted) return; paused=!paused; elPauseOverlay.style.display = paused? 'flex':'none'; }

document.addEventListener('keydown', e=>{
    if(e.key.toLowerCase()==='p') togglePause();
    if(e.key.toLowerCase()==='r'){ resetGame(); }
});

elBtnStart.addEventListener('click', startGame);
elBtnReset.addEventListener('click', resetGame);
elBtnPause.addEventListener('click', togglePause);
elHomeStart.addEventListener('click', startGame);
elBtnResume.addEventListener('click', togglePause);

elHomeHow.addEventListener('click', ()=>{
    alert('扩展建议:\n1) 加入像素美术资源与动画帧；\n2) 增加游泳、攀爬、下蹲穿越平台等动作；\n3) 丰富武器：追踪、激光、导弹；\n4) 关卡以 JSON/TMX（Tiled）描述；\n5) 存档/关卡解锁系统；\n6) 移动端触控按钮。');
});
elHomeCredits.addEventListener('click', ()=>{
    alert('原型实现：原生 JS + Canvas。无外部依赖，便于学习与二次开发。');
});

// 初始进入演示界面
elHome.style.display='flex';
loop();
