import Phaser from 'phaser';
import { generateAllTextures } from '../utils/textures.js';

/**
 * Boot scene — generates all procedural textures, then jumps to the menu.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    generateAllTextures(this);
    this.scene.start('Menu');
  }
}
