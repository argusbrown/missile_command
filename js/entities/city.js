import { CITY_WIDTH, CITY_HEIGHT } from '../config.js';

export class City {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CITY_WIDTH;
        this.height = CITY_HEIGHT;
        this.alive = true;
        // Generate random skyline buildings
        this.buildings = this.generateBuildings();
    }

    generateBuildings() {
        const buildings = [];
        const count = 4 + Math.floor(Math.random() * 3);
        const slotWidth = this.width / count;
        for (let i = 0; i < count; i++) {
            buildings.push({
                x: this.x - this.width / 2 + i * slotWidth,
                w: slotWidth - 2,
                h: 8 + Math.random() * (this.height - 8),
            });
        }
        return buildings;
    }

    destroy() {
        this.alive = false;
    }

    restore() {
        this.alive = true;
        this.buildings = this.generateBuildings();
    }
}
