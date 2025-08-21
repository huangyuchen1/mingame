function drawFighter(ctx,f){
    ctx.save();
    ctx.fillStyle=f.color;
    ctx.fillRect(f.x,f.y,f.w,f.h);
    ctx.restore();
}