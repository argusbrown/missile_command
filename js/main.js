import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Game } from './game.js';
import { startLoop } from './loop.js';

function init() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    function resize() {
        const windowRatio = window.innerWidth / window.innerHeight;
        const gameRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

        let width, height;
        if (windowRatio > gameRatio) {
            height = window.innerHeight;
            width = height * gameRatio;
        } else {
            width = window.innerWidth;
            height = width / gameRatio;
        }

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }

    window.addEventListener('resize', resize);
    resize();

    const renderer = new Renderer(ctx);
    const input = new Input(canvas);
    const game = new Game(renderer, input);

    startLoop(game);
}

window.addEventListener('DOMContentLoaded', init);
