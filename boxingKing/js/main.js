const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');


let p1=new Fighter({x:200,y:400,color:'#6bd1ff'});
let p2=new Fighter({x:700,y:400,color:'#ff6b6b'});


function update(){
// 输入
    if(keys.has('a')) p1.x-=3;
    if(keys.has('d')) p1.x+=3;
    if(keys.has('w')) p1.y-=3;
    if(keys.has('s')) p1.y+=3;


// AI
    cpuController(p2,p1);
    p2.x+=p2.vx;
}


function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawFighter(ctx,p1);
    drawFighter(ctx,p2);
}


function loop(){
    update();
    render();
    requestAnimationFrame(loop);
}
loop();