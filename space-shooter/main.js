import { initGame, gameLoop } from "./core/game.js";
import { setupInput } from "./core/input.js";

window.addEventListener("load", () => {
    console.log("loading....");
    initGame();
    console.log("loaded success");
    setupInput();
    requestAnimationFrame(gameLoop);
});
