import 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import './style.css';

/**
 * Phaser game configuration.
 *
 * The canvas uses a portrait-leaning internal resolution and the FIT scale
 * mode so it adapts to any viewport while preserving aspect ratio. This
 * keeps the game responsive across desktop and mobile.
 */
const GAME_WIDTH = 480;
const GAME_HEIGHT = 720;

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0b1021',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
};

window.addEventListener('load', () => {
  window.game = new Phaser.Game(config);
});
