# Missile Command

## Project Overview

Browser-based clone of the classic 1980s Missile Command arcade game. Vanilla JavaScript + HTML5 Canvas, zero dependencies.

## Current Status

**Complete and playable.** All core features are implemented:

- 3 missile bases with 10 ammo each per wave
- 6 cities with procedural building skylines
- Mouse-driven targeting with crosshair cursor
- Enemy ICBM waves with increasing difficulty
- MIRV splitting missiles from wave 5 onward
- Expanding/contracting explosions with chain reactions
- Wave scoring (enemy kills, surviving cities, unused ammo)
- Bonus city every 10,000 points
- Procedural Web Audio sound effects
- Screen shake on city hits
- High score saved to localStorage
- Color palette cycling per wave

## Architecture

```
index.html          → entry point
css/style.css       → fullscreen canvas layout
js/
  main.js           → canvas init, resize, boot
  game.js           → state machine (title/playing/wave_clear/game_over)
  loop.js           → fixed 60Hz timestep loop
  config.js         → all tunable constants
  input.js          → mouse → logical coords
  renderer.js       → all Canvas 2D drawing
  entities/         → Base, City, PlayerMissile, EnemyMissile, Explosion
  systems/          → Spawner, Collision, Score, Audio
```

## How to Run

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Potential Enhancements

- Touch/mobile support
- Particle effects for debris
- Smart bomb / special weapon power-ups
- Leaderboard (cloud-backed)
- Pause menu
- Difficulty selection
