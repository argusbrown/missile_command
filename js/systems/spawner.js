import { WAVES, CANVAS_WIDTH, MIRV_MIN_WAVE, MIRV_SPLIT_ALTITUDE, MIRV_CHILDREN } from '../config.js';
import { EnemyMissile } from '../entities/enemy-missile.js';

export class Spawner {
    constructor() {
        this.reset(0);
    }

    reset(waveNumber) {
        this.waveNumber = waveNumber;
        const waveIndex = waveNumber % WAVES.length;
        const multiplier = 1 + Math.floor(waveNumber / WAVES.length) * 0.3;
        const wave = WAVES[waveIndex];

        this.enemyCount = Math.floor(wave.enemyCount * multiplier);
        this.speed = wave.speed * multiplier;
        this.spawnInterval = wave.spawnInterval / multiplier;
        this.spawned = 0;
        this.timer = 0;
    }

    update(dt, targets) {
        const newMissiles = [];
        if (this.spawned >= this.enemyCount) return newMissiles;

        this.timer += dt;
        while (this.timer >= this.spawnInterval && this.spawned < this.enemyCount) {
            this.timer -= this.spawnInterval;
            const missile = this.spawnMissile(targets);
            if (missile) {
                // Mark some as MIRVs in later waves
                if (this.waveNumber >= MIRV_MIN_WAVE && Math.random() < 0.25) {
                    missile.isMirv = true;
                }
                newMissiles.push(missile);
                this.spawned++;
            }
        }

        return newMissiles;
    }

    spawnMissile(targets) {
        if (targets.length === 0) return null;
        const target = targets[Math.floor(Math.random() * targets.length)];
        const startX = Math.random() * CANVAS_WIDTH;
        const startY = -10;
        return new EnemyMissile(startX, startY, target.x, target.y, this.speed);
    }

    isDone() {
        return this.spawned >= this.enemyCount;
    }
}

export function checkMirvSplit(enemyMissiles, targets) {
    const newMissiles = [];
    for (const missile of enemyMissiles) {
        if (missile.isMirv && !missile.mirvSplit && !missile.destroyed && missile.currentY >= MIRV_SPLIT_ALTITUDE) {
            missile.mirvSplit = true;
            for (let i = 0; i < MIRV_CHILDREN; i++) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                if (target) {
                    const child = new EnemyMissile(
                        missile.currentX, missile.currentY,
                        target.x, target.y,
                        missile.speed * 1.1
                    );
                    newMissiles.push(child);
                }
            }
        }
    }
    return newMissiles;
}
