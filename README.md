# Starfall — Phaser 3 Space Shooter

Starfall is a responsive 2D arcade shooter built with Phaser 3 and Vite. The game is designed as a compact playable experience for desktop and mobile, with all visuals and sound generated procedurally so the build stays lightweight and asset-free.

## Game Overview

Pilot a starfighter through five escalating enemy waves and defeat the final boss to win. The player starts with three lives and must survive while collecting power-ups and extra lives.

### Objective

- Survive all waves of alien enemies
- Defeat the boss in Wave 5
- Avoid losing all lives

### Core Features

- 5 waves of increasing difficulty
- Multiple enemy types with distinct movement and attack patterns
- Boss battle with a health bar
- Power-ups for rapid fire, shielding, and spread shots
- Extra-life pickups
- Pause and mute controls
- Responsive scaling for different screen sizes
- Procedural textures and sound effects
- Clean restart and return-to-menu flow

## Controls

| Action | Input |
|--------|-------|
| Move | Arrow keys / WASD / drag on touch devices |
| Fire | Space / click / tap |
| Pause | P or ESC |
| Mute | M |

## Tech Stack

- Phaser 3
- Vite
- JavaScript (ES modules)

## Project Structure

```text
src/
├── main.js                  # Phaser game configuration and entry point
├── style.css                # Canvas and page styling
├── objects/
│   ├── BulletPool.js        # Player bullet pooling
│   ├── Enemy.js            # Enemy types and AI behavior
│   ├── EnemyBulletPool.js  # Enemy bullet pooling
│   ├── Explosion.js        # Explosion effects
│   ├── Player.js           # Player movement, firing, lives, power-ups
│   └── PowerUp.js          # Power-up and extra-life pickups
├── scenes/
│   ├── BootScene.js        # Texture generation and scene bootstrap
│   ├── GameOverScene.js    # Win/lose screen
│   ├── GameScene.js        # Main gameplay loop, waves, collisions
│   ├── HUD.js              # Score, lives, wave, and power display
│   ├── MenuScene.js        # Title screen and instructions
│   └── Starfield.js        # Parallax star background
└── utils/
    ├── sound.js            # Procedural audio synthesis
    └── textures.js         # Procedural texture generation
```

## Installation and Running Locally

Prerequisites: Node.js 18+ and npm

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, typically http://localhost:5173/.

### Production Build

```bash
npm run build
npm run preview
```

## Build Notes

The production build is lightweight and suitable for a browser-based playable. Because the game uses procedural assets instead of image or audio files, the final bundle remains small and under the 5 MB requirement.

## Assumptions and Future Improvements

### Current trade-offs

- Procedural art is used instead of hand-drawn sprites for a smaller build size
- Audio is synthesized at runtime rather than stored as audio files
- The gameplay is tuned for a compact portrait-style playable experience

### Possible improvements

- Add persistent high-score storage
- Add more enemy varieties and level events
- Improve mobile touch controls further
- Add richer animations and screen effects

## License

This project uses original code and procedural assets. Phaser 3 and Vite are used under their respective open-source licenses.
