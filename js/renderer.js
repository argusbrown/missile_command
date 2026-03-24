import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, GROUND_HEIGHT, WAVE_COLORS } from './config.js';

export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.stars = this.generateStars(60);
        this.screenShake = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    }

    generateStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * (GROUND_Y - 50),
                brightness: 0.3 + Math.random() * 0.7,
            });
        }
        return stars;
    }

    shake(intensity = 8) {
        this.screenShake = intensity;
    }

    clear(waveNumber) {
        const ctx = this.ctx;

        // Apply screen shake
        if (this.screenShake > 0) {
            this.shakeX = (Math.random() - 0.5) * this.screenShake;
            this.shakeY = (Math.random() - 0.5) * this.screenShake;
            this.screenShake *= 0.9;
            if (this.screenShake < 0.5) this.screenShake = 0;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        ctx.save();
        ctx.translate(this.shakeX, this.shakeY);

        const colorIndex = (waveNumber || 0) % WAVE_COLORS.length;
        ctx.fillStyle = WAVE_COLORS[colorIndex].sky;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    restore() {
        this.ctx.restore();
    }

    drawStars() {
        const ctx = this.ctx;
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.fillRect(star.x, star.y, 1.5, 1.5);
        }
    }

    drawGround() {
        const ctx = this.ctx;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, GROUND_HEIGHT);
        // Darker edge
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 3);
    }

    drawBases(bases) {
        const ctx = this.ctx;
        for (const base of bases) {
            if (!base.alive) {
                // Rubble
                ctx.fillStyle = '#555';
                ctx.fillRect(base.x - 15, base.y - 3, 30, 6);
                continue;
            }

            // Base structure - trapezoid
            ctx.fillStyle = '#4a7a4a';
            ctx.beginPath();
            ctx.moveTo(base.x - base.width / 2, base.y);
            ctx.lineTo(base.x - 10, base.y - base.height);
            ctx.lineTo(base.x + 10, base.y - base.height);
            ctx.lineTo(base.x + base.width / 2, base.y);
            ctx.closePath();
            ctx.fill();

            // Ammo ticks
            ctx.fillStyle = '#aaffaa';
            const tickWidth = 3;
            const gap = 2;
            const totalWidth = base.ammo * (tickWidth + gap) - gap;
            const startX = base.x - totalWidth / 2;
            for (let i = 0; i < base.ammo; i++) {
                ctx.fillRect(startX + i * (tickWidth + gap), base.y - base.height - 8, tickWidth, 5);
            }
        }
    }

    drawCities(cities) {
        const ctx = this.ctx;
        for (const city of cities) {
            if (!city.alive) {
                // Rubble
                ctx.fillStyle = '#444';
                ctx.fillRect(city.x - city.width / 2, city.y - 3, city.width, 5);
                ctx.fillStyle = '#333';
                for (let i = 0; i < 4; i++) {
                    const rx = city.x - city.width / 2 + Math.random() * city.width;
                    ctx.fillRect(rx, city.y - 2 - Math.random() * 3, 4, 3);
                }
                continue;
            }

            // Buildings
            for (const b of city.buildings) {
                ctx.fillStyle = '#00cccc';
                ctx.fillRect(b.x, city.y - b.h, b.w, b.h);
                // Windows
                ctx.fillStyle = '#ffff66';
                for (let wy = city.y - b.h + 3; wy < city.y - 2; wy += 5) {
                    for (let wx = b.x + 2; wx < b.x + b.w - 2; wx += 4) {
                        if (Math.random() > 0.3) {
                            ctx.fillRect(wx, wy, 2, 2);
                        }
                    }
                }
            }
        }
    }

    drawPlayerMissiles(missiles) {
        const ctx = this.ctx;
        for (const m of missiles) {
            // Trail
            ctx.strokeStyle = '#6666ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(m.startX, m.startY);
            ctx.lineTo(m.currentX, m.currentY);
            ctx.stroke();

            // Head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(m.currentX, m.currentY, 2, 0, Math.PI * 2);
            ctx.fill();

            // Target marker (crosshair at destination)
            ctx.strokeStyle = 'rgba(100, 100, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(m.targetX - 6, m.targetY);
            ctx.lineTo(m.targetX + 6, m.targetY);
            ctx.moveTo(m.targetX, m.targetY - 6);
            ctx.lineTo(m.targetX, m.targetY + 6);
            ctx.stroke();
        }
    }

    drawEnemyMissiles(missiles, waveNumber) {
        const ctx = this.ctx;
        const colorIndex = (waveNumber || 0) % WAVE_COLORS.length;
        const colors = WAVE_COLORS[colorIndex];

        for (const m of missiles) {
            if (m.destroyed) continue;

            // Trail
            ctx.strokeStyle = colors.trail;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(m.startX, m.startY);
            ctx.lineTo(m.currentX, m.currentY);
            ctx.stroke();

            // Head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(m.currentX, m.currentY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // MIRV indicator
            if (m.isMirv && !m.mirvSplit) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(m.currentX, m.currentY, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    drawExplosions(explosions) {
        const ctx = this.ctx;
        for (const e of explosions) {
            if (e.done || e.radius <= 0) continue;

            const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
            if (e.isEnemy) {
                gradient.addColorStop(0, 'rgba(255, 200, 100, 0.9)');
                gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 50, 0, 0.1)');
            } else {
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(0.3, 'rgba(255, 255, 100, 0.8)');
                gradient.addColorStop(0.6, 'rgba(255, 150, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 50, 0, 0.1)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawCrosshair(x, y) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        const size = 10;

        ctx.beginPath();
        ctx.moveTo(x - size, y);
        ctx.lineTo(x + size, y);
        ctx.moveTo(x, y - size);
        ctx.lineTo(x, y + size);
        ctx.stroke();
    }

    drawHUD(score, wave, highScore) {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px "Courier New", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${score}`, 15, 25);
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE ${wave + 1}`, CANVAS_WIDTH / 2, 25);
        ctx.textAlign = 'right';
        ctx.fillText(`HIGH: ${highScore}`, CANVAS_WIDTH - 15, 25);
    }

    drawTitle() {
        const ctx = this.ctx;

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 64px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MISSILE COMMAND', CANVAS_WIDTH / 2, 180);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Courier New", monospace';
        ctx.fillText('CLICK TO START', CANVAS_WIDTH / 2, 280);

        ctx.fillStyle = '#888888';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('Defend your cities from incoming missiles', CANVAS_WIDTH / 2, 340);
        ctx.fillText('Click to launch counter-missiles', CANVAS_WIDTH / 2, 365);
        ctx.fillText('Nearest base with ammo fires automatically', CANVAS_WIDTH / 2, 390);
    }

    drawWaveClear(wave, bonus, scoreManager) {
        const ctx = this.ctx;

        ctx.fillStyle = '#ffff44';
        ctx.font = 'bold 36px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE ${wave + 1} COMPLETE`, CANVAS_WIDTH / 2, 200);

        ctx.fillStyle = '#ffffff';
        ctx.font = '22px "Courier New", monospace';
        ctx.fillText(`BONUS: ${bonus}`, CANVAS_WIDTH / 2, 260);
    }

    drawGameOver(score) {
        const ctx = this.ctx;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 72px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('THE END', CANVAS_WIDTH / 2, 220);

        ctx.fillStyle = '#ffffff';
        ctx.font = '28px "Courier New", monospace';
        ctx.fillText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, 300);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText('CLICK TO PLAY AGAIN', CANVAS_WIDTH / 2, 370);
    }
}
