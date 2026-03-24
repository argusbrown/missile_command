import { PLAYER_MISSILE_SPEED } from '../config.js';

export class PlayerMissile {
    constructor(startX, startY, targetX, targetY) {
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;

        const dx = targetX - startX;
        const dy = targetY - startY;
        this.distance = Math.sqrt(dx * dx + dy * dy);
        this.progress = 0; // 0 to 1
        this.speed = PLAYER_MISSILE_SPEED;
        this.done = false;
        this.arrived = false;
    }

    get currentX() {
        return this.startX + (this.targetX - this.startX) * this.progress;
    }

    get currentY() {
        return this.startY + (this.targetY - this.startY) * this.progress;
    }

    update(dt) {
        if (this.done) return;
        const step = (this.speed * dt) / this.distance;
        this.progress += step;
        if (this.progress >= 1) {
            this.progress = 1;
            this.done = true;
            this.arrived = true;
        }
    }
}
