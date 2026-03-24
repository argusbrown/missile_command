import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';

export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouseX = CANVAS_WIDTH / 2;
        this.mouseY = CANVAS_HEIGHT / 2;
        this.clicks = [];

        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('click', (e) => this.onClick(e));
    }

    // Convert screen coords to logical coords
    toLogical(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }

    onMouseMove(e) {
        const pos = this.toLogical(e);
        this.mouseX = pos.x;
        this.mouseY = pos.y;
    }

    onClick(e) {
        const pos = this.toLogical(e);
        this.clicks.push(pos);
    }

    consumeClicks() {
        const clicks = this.clicks;
        this.clicks = [];
        return clicks;
    }
}
