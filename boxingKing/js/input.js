const keys = new Set();
const once = new Set();


addEventListener('keydown', e => {
    keys.add(e.key.toLowerCase());
});
addEventListener('keyup', e => {
    keys.delete(e.key.toLowerCase());
    once.delete(e.key.toLowerCase());
});


function justPressed(k) {
    return keys.has(k) && !once.has(k) && (once.add(k), true);
}