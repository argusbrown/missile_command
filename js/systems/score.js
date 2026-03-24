import { SCORE_PER_ENEMY, SCORE_PER_UNUSED_MISSILE, SCORE_PER_SURVIVING_CITY, BONUS_CITY_THRESHOLD } from '../config.js';

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.nextBonusCityAt = BONUS_CITY_THRESHOLD;
        this.waveBonus = 0;
    }

    reset() {
        this.score = 0;
        this.nextBonusCityAt = BONUS_CITY_THRESHOLD;
        this.waveBonus = 0;
    }

    addEnemyKill() {
        this.score += SCORE_PER_ENEMY;
    }

    calculateWaveBonus(bases, cities) {
        let bonus = 0;
        for (const base of bases) {
            bonus += base.ammo * SCORE_PER_UNUSED_MISSILE;
        }
        for (const city of cities) {
            if (city.alive) bonus += SCORE_PER_SURVIVING_CITY;
        }
        this.waveBonus = bonus;
        this.score += bonus;
        return bonus;
    }

    checkBonusCity() {
        if (this.score >= this.nextBonusCityAt) {
            this.nextBonusCityAt += BONUS_CITY_THRESHOLD;
            return true;
        }
        return false;
    }
}
