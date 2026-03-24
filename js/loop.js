const TICK_RATE = 1 / 60;
const MAX_FRAME_TIME = 0.25; // prevent spiral of death

export function startLoop(game) {
    let lastTime = 0;
    let accumulator = 0;

    function frame(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, MAX_FRAME_TIME);
        lastTime = timestamp;
        accumulator += dt;

        while (accumulator >= TICK_RATE) {
            game.update(TICK_RATE);
            accumulator -= TICK_RATE;
        }

        game.render();
        requestAnimationFrame(frame);
    }

    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        requestAnimationFrame(frame);
    });
}
