// Logical canvas dimensions (16:9, scales to fit window)
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// Ground
export const GROUND_Y = 500;
export const GROUND_HEIGHT = 40;

// Bases
export const BASE_WIDTH = 40;
export const BASE_HEIGHT = 30;
export const BASE_AMMO = 10;
export const BASE_POSITIONS = [
    { x: 96, y: GROUND_Y },
    { x: 480, y: GROUND_Y },
    { x: 864, y: GROUND_Y },
];

// Cities
export const CITY_WIDTH = 50;
export const CITY_HEIGHT = 25;
export const CITY_POSITIONS = [
    { x: 192, y: GROUND_Y },
    { x: 288, y: GROUND_Y },
    { x: 384, y: GROUND_Y },
    { x: 576, y: GROUND_Y },
    { x: 672, y: GROUND_Y },
    { x: 768, y: GROUND_Y },
];

// Player missiles
export const PLAYER_MISSILE_SPEED = 500; // px/sec

// Explosions
export const EXPLOSION_MAX_RADIUS = 45;
export const EXPLOSION_EXPAND_TIME = 0.4;
export const EXPLOSION_HOLD_TIME = 0.15;
export const EXPLOSION_CONTRACT_TIME = 0.35;

// Enemy missiles
export const ENEMY_BASE_SPEED = 50;

// Scoring
export const SCORE_PER_ENEMY = 25;
export const SCORE_PER_UNUSED_MISSILE = 5;
export const SCORE_PER_SURVIVING_CITY = 100;
export const BONUS_CITY_THRESHOLD = 10000;

// Wave definitions (repeats with multiplier after exhausted)
export const WAVES = [
    { enemyCount: 8,  speed: 50,  spawnInterval: 2.0 },
    { enemyCount: 10, speed: 55,  spawnInterval: 1.8 },
    { enemyCount: 12, speed: 60,  spawnInterval: 1.5 },
    { enemyCount: 14, speed: 65,  spawnInterval: 1.3 },
    { enemyCount: 16, speed: 70,  spawnInterval: 1.1 },
    { enemyCount: 18, speed: 80,  spawnInterval: 1.0 },
    { enemyCount: 20, speed: 90,  spawnInterval: 0.9 },
    { enemyCount: 22, speed: 100, spawnInterval: 0.8 },
    { enemyCount: 24, speed: 110, spawnInterval: 0.7 },
    { enemyCount: 26, speed: 120, spawnInterval: 0.6 },
];

// Wave palette colors (cycles through)
export const WAVE_COLORS = [
    { enemy: '#ff4444', trail: '#ff6666', sky: '#000011' },
    { enemy: '#44ff44', trail: '#66ff66', sky: '#001100' },
    { enemy: '#ff44ff', trail: '#ff66ff', sky: '#110011' },
    { enemy: '#ffff44', trail: '#ffff66', sky: '#111100' },
    { enemy: '#44ffff', trail: '#66ffff', sky: '#001111' },
    { enemy: '#ff8844', trail: '#ffaa66', sky: '#110800' },
];

// MIRV config (splitting missiles for later waves)
export const MIRV_MIN_WAVE = 4;
export const MIRV_SPLIT_ALTITUDE = 200; // y position where split occurs
export const MIRV_CHILDREN = 2;
