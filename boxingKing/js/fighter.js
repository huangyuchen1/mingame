class Fighter {
    constructor(opts) {
        Object.assign(this, { x:200, y:400, w:44, h:84, vx:0, vy:0, dir:1, hp:100, maxhp:100, state:'idle', color:'#58a6ff' }, opts);
    }


    get feet() { return this.y + this.h; }
    get centerX() { return this.x + this.w/2; }
}