import {
    EXPLOSION_MAX_RADIUS,
    EXPLOSION_EXPAND_TIME,
    EXPLOSION_HOLD_TIME,
    EXPLOSION_CONTRACT_TIME,
} from '../config.js';

export class Explosion {
    constructor(x, y, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.maxRadius = isEnemy ? EXPLOSION_MAX_RADIUS * 0.5 : EXPLOSION_MAX_RADIUS;
        this.radius = 0;
        this.time = 0;
        this.done = false;
        this.isEnemy = isEnemy;
        this.totalTime = EXPLOSION_EXPAND_TIME + EXPLOSION_HOLD_TIME + EXPLOSION_CONTRACT_TIME;
    }

    update(dt) {
        if (this.done) return;
        this.time += dt;

        if (this.time < EXPLOSION_EXPAND_TIME) {
            // Expanding
            this.radius = this.maxRadius * (this.time / EXPLOSION_EXPAND_TIME);
        } else if (this.time < EXPLOSION_EXPAND_TIME + EXPLOSION_HOLD_TIME) {
            // Holding
            this.radius = this.maxRadius;
        } else if (this.time < this.totalTime) {
            // Contracting
            const contractProgress =
                (this.time - EXPLOSION_EXPAND_TIME - EXPLOSION_HOLD_TIME) / EXPLOSION_CONTRACT_TIME;
            this.radius = this.maxRadius * (1 - contractProgress);
        } else {
            this.radius = 0;
            this.done = true;
        }
    }
}
