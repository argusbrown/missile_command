export function checkCollisions(explosions, enemyMissiles) {
    const destroyed = [];

    for (const explosion of explosions) {
        if (explosion.done || explosion.isEnemy) continue;

        for (const missile of enemyMissiles) {
            if (missile.done || missile.destroyed) continue;

            const dx = explosion.x - missile.currentX;
            const dy = explosion.y - missile.currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < explosion.radius) {
                missile.destroyed = true;
                missile.done = true;
                destroyed.push(missile);
            }
        }
    }

    return destroyed;
}

export function checkGroundHits(enemyMissiles, bases, cities) {
    const hits = [];

    for (const missile of enemyMissiles) {
        if (!missile.done || missile.destroyed) continue;

        // Find what was hit
        let hitTarget = null;
        let minDist = Infinity;

        for (const base of bases) {
            if (!base.alive) continue;
            const dx = missile.targetX - base.x;
            const dy = missile.targetY - base.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30 && dist < minDist) {
                minDist = dist;
                hitTarget = base;
            }
        }

        for (const city of cities) {
            if (!city.alive) continue;
            const dx = missile.targetX - city.x;
            const dy = missile.targetY - city.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30 && dist < minDist) {
                minDist = dist;
                hitTarget = city;
            }
        }

        if (hitTarget) {
            hitTarget.alive = false;
            hits.push({ missile, target: hitTarget });
        }
    }

    return hits;
}
