import { BASE_POSITIONS, CITY_POSITIONS, GROUND_Y } from './config.js';
import { Base } from './entities/base.js';
import { City } from './entities/city.js';
import { PlayerMissile } from './entities/player-missile.js';
import { Explosion } from './entities/explosion.js';
import { Spawner, checkMirvSplit } from './systems/spawner.js';
import { checkCollisions, checkGroundHits } from './systems/collision.js';
import { ScoreManager } from './systems/score.js';
import { Audio } from './systems/audio.js';

const State = {
    TITLE: 'title',
    PLAYING: 'playing',
    WAVE_CLEAR: 'wave_clear',
    GAME_OVER: 'game_over',
};

export class Game {
    constructor(renderer, input) {
        this.renderer = renderer;
        this.input = input;
        this.audio = new Audio();
        this.scoreManager = new ScoreManager();
        this.spawner = new Spawner();
        this.highScore = parseInt(localStorage.getItem('missileCommandHighScore') || '0');

        this.state = State.TITLE;
        this.stateTimer = 0;
        this.waveNumber = 0;

        this.bases = BASE_POSITIONS.map(p => new Base(p.x, p.y));
        this.cities = CITY_POSITIONS.map(p => new City(p.x, p.y));
        this.playerMissiles = [];
        this.enemyMissiles = [];
        this.explosions = [];
    }

    update(dt) {
        switch (this.state) {
            case State.TITLE:
                this.updateTitle(dt);
                break;
            case State.PLAYING:
                this.updatePlaying(dt);
                break;
            case State.WAVE_CLEAR:
                this.updateWaveClear(dt);
                break;
            case State.GAME_OVER:
                this.updateGameOver(dt);
                break;
        }
    }

    render() {
        const r = this.renderer;
        r.clear(this.waveNumber);

        // Always draw the scene
        r.drawStars();
        r.drawGround();
        r.drawBases(this.bases);
        r.drawCities(this.cities);
        r.drawEnemyMissiles(this.enemyMissiles, this.waveNumber);
        r.drawPlayerMissiles(this.playerMissiles);
        r.drawExplosions(this.explosions);

        if (this.state !== State.TITLE) {
            r.drawHUD(this.scoreManager.score, this.waveNumber, this.highScore);
        }

        r.drawCrosshair(this.input.mouseX, this.input.mouseY);

        switch (this.state) {
            case State.TITLE:
                r.drawTitle();
                break;
            case State.WAVE_CLEAR:
                r.drawWaveClear(this.waveNumber, this.scoreManager.waveBonus, this.scoreManager);
                break;
            case State.GAME_OVER:
                r.drawGameOver(this.scoreManager.score);
                break;
        }

        r.restore();
    }

    // --- State updates ---

    updateTitle(dt) {
        const clicks = this.input.consumeClicks();
        if (clicks.length > 0) {
            this.audio.ensure();
            this.startNewGame();
        }
    }

    updatePlaying(dt) {
        // Handle clicks - launch player missiles
        const clicks = this.input.consumeClicks();
        for (const click of clicks) {
            if (click.y >= GROUND_Y) continue; // Don't fire at ground
            this.launchPlayerMissile(click.x, click.y);
        }

        // Spawn enemies
        const targets = this.getAliveTargets();
        const newEnemies = this.spawner.update(dt, targets);
        this.enemyMissiles.push(...newEnemies);

        // Check MIRV splits
        const mirvChildren = checkMirvSplit(this.enemyMissiles, targets);
        this.enemyMissiles.push(...mirvChildren);

        // Update entities
        for (const m of this.playerMissiles) m.update(dt);
        for (const m of this.enemyMissiles) m.update(dt);
        for (const e of this.explosions) e.update(dt);

        // Player missiles that arrived → create explosions
        for (const m of this.playerMissiles) {
            if (m.arrived) {
                this.explosions.push(new Explosion(m.targetX, m.targetY));
                this.audio.playExplosion();
                m.arrived = false; // only spawn once
            }
        }

        // Collision: explosions vs enemy missiles
        const destroyed = checkCollisions(this.explosions, this.enemyMissiles);
        for (const m of destroyed) {
            this.scoreManager.addEnemyKill();
            // Chain explosion for destroyed enemies
            this.explosions.push(new Explosion(m.currentX, m.currentY, true));
        }

        // Ground hits
        const hits = checkGroundHits(this.enemyMissiles, this.bases, this.cities);
        for (const hit of hits) {
            this.explosions.push(new Explosion(hit.missile.targetX, hit.missile.targetY, true));
            this.renderer.shake(6);
            this.audio.playCityHit();
        }

        // Cleanup done entities
        this.playerMissiles = this.playerMissiles.filter(m => !m.done);
        this.enemyMissiles = this.enemyMissiles.filter(m => !m.done);
        this.explosions = this.explosions.filter(e => !e.done);

        // Check wave complete
        if (this.spawner.isDone() && this.enemyMissiles.length === 0 && this.explosions.length === 0) {
            this.onWaveClear();
        }

        // Check game over
        if (!this.cities.some(c => c.alive)) {
            this.onGameOver();
        }
    }

    updateWaveClear(dt) {
        this.stateTimer += dt;
        this.input.consumeClicks();
        if (this.stateTimer > 3) {
            this.startNextWave();
        }
    }

    updateGameOver(dt) {
        this.stateTimer += dt;
        if (this.stateTimer > 1.5) {
            const clicks = this.input.consumeClicks();
            if (clicks.length > 0) {
                this.state = State.TITLE;
            }
        } else {
            this.input.consumeClicks();
        }
    }

    // --- Actions ---

    launchPlayerMissile(targetX, targetY) {
        // Find nearest base with ammo
        let bestBase = null;
        let bestDist = Infinity;

        for (const base of this.bases) {
            if (!base.hasAmmo()) continue;
            const dx = targetX - base.x;
            const dy = targetY - base.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist) {
                bestDist = dist;
                bestBase = base;
            }
        }

        if (bestBase) {
            bestBase.useAmmo();
            const missile = new PlayerMissile(bestBase.x, bestBase.y - bestBase.height, targetX, targetY);
            this.playerMissiles.push(missile);
            this.audio.playLaunch();
        }
    }

    getAliveTargets() {
        const targets = [];
        for (const c of this.cities) {
            if (c.alive) targets.push(c);
        }
        for (const b of this.bases) {
            if (b.alive) targets.push(b);
        }
        return targets;
    }

    startNewGame() {
        this.scoreManager.reset();
        this.waveNumber = 0;
        this.playerMissiles = [];
        this.enemyMissiles = [];
        this.explosions = [];

        for (const base of this.bases) base.reset();
        for (const city of this.cities) city.restore();

        this.spawner.reset(this.waveNumber);
        this.state = State.PLAYING;
    }

    startNextWave() {
        this.waveNumber++;
        this.playerMissiles = [];
        this.enemyMissiles = [];
        this.explosions = [];

        for (const base of this.bases) base.reset();

        this.spawner.reset(this.waveNumber);
        this.state = State.PLAYING;
    }

    onWaveClear() {
        this.audio.playWaveClear();
        this.scoreManager.calculateWaveBonus(this.bases, this.cities);

        // Check for bonus city
        if (this.scoreManager.checkBonusCity()) {
            const deadCity = this.cities.find(c => !c.alive);
            if (deadCity) deadCity.restore();
        }

        this.stateTimer = 0;
        this.state = State.WAVE_CLEAR;
    }

    onGameOver() {
        this.audio.playGameOver();
        if (this.scoreManager.score > this.highScore) {
            this.highScore = this.scoreManager.score;
            localStorage.setItem('missileCommandHighScore', String(this.highScore));
        }
        this.stateTimer = 0;
        this.state = State.GAME_OVER;
    }
}
