# Missile Command

A browser-based clone of the classic 1980s arcade game, built with vanilla JavaScript and HTML5 Canvas.

![Missile Command](https://img.shields.io/badge/game-Missile%20Command-red)

## How to Play

### Objective

Defend your six cities from waves of incoming enemy missiles. The game ends when all cities are destroyed.

### Controls

- **Mouse** — Aim your crosshair
- **Click** — Launch a counter-missile toward the crosshair position

The nearest missile base with remaining ammo fires automatically. You have three bases (left, center, right), each with 10 missiles per wave.

### Gameplay

1. Enemy missiles fall from the sky toward your cities and bases.
2. Click to launch counter-missiles. They fly to where you clicked and explode.
3. Explosions expand outward — any enemy missile caught in the blast is destroyed.
4. Destroyed enemies trigger chain explosions that can take out nearby missiles.
5. Survive the wave to earn bonus points and advance.

### Scoring

| Event | Points |
|---|---|
| Enemy missile destroyed | 25 |
| Surviving city (end of wave) | 100 |
| Unused missile (end of wave) | 5 |

A bonus city is restored every 10,000 points.

### Wave Progression

- Each wave brings more and faster missiles.
- From wave 5 onward, some missiles are **MIRVs** — they split into multiple warheads mid-flight.
- The sky color changes each wave.

## Installation

### Quick Start

No build tools or dependencies required. Just serve the files with any HTTP server:

```bash
# Clone the repo
git clone https://github.com/argusbrown/missile_command.git
cd missile_command

# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local HTTP server (ES modules require serving over HTTP, not `file://`)

## Project Structure

```
missile_command/
├── index.html              # Entry point
├── css/style.css           # Styling and layout
└── js/
    ├── main.js             # Canvas setup, resize handling, boot
    ├── game.js             # Game state machine and core logic
    ├── loop.js             # Fixed-timestep game loop (60 Hz)
    ├── config.js           # All tunable constants
    ├── input.js            # Mouse input handling
    ├── renderer.js         # All Canvas 2D drawing
    ├── entities/
    │   ├── base.js         # Missile base
    │   ├── city.js         # City with procedural skyline
    │   ├── player-missile.js
    │   ├── enemy-missile.js
    │   └── explosion.js
    └── systems/
        ├── spawner.js      # Enemy wave spawning and MIRV logic
        ├── collision.js    # Explosion-vs-missile and ground-hit detection
        ├── score.js        # Scoring and bonus city tracking
        └── audio.js        # Procedural Web Audio sound effects
```

## Tech Stack

- **Vanilla JavaScript** (ES modules) — zero dependencies
- **HTML5 Canvas 2D** — 960×540 logical resolution, scales to fit any window
- **Web Audio API** — procedural retro sound effects
- **localStorage** — high score persistence
