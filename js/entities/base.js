import { BASE_AMMO, BASE_WIDTH, BASE_HEIGHT } from '../config.js';

export class Base {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = BASE_WIDTH;
        this.height = BASE_HEIGHT;
        this.ammo = BASE_AMMO;
        this.alive = true;
    }

    reset() {
        this.alive = true;
        this.ammo = BASE_AMMO;
    }

    hasAmmo() {
        return this.alive && this.ammo > 0;
    }

    useAmmo() {
        if (this.ammo > 0) this.ammo--;
    }
}
