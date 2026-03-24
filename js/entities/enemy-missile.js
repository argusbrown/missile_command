export class EnemyMissile {
    constructor(startX, startY, targetX, targetY, speed) {
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;

        const dx = targetX - startX;
        const dy = targetY - startY;
        this.distance = Math.sqrt(dx * dx + dy * dy);
        this.progress = 0;
        this.done = false;
        this.destroyed = false; // true if killed by explosion
        this.isMirv = false;
        this.mirvSplit = false;
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
        }
    }
}
