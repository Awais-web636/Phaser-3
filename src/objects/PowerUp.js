import Phaser from 'phaser';
import { POWER_TYPES } from './Player.js';

const FALL_SPEED = 90;
const POWER_KEYS = [
  { type: POWER_TYPES.RAPID, texture: 'powerRapid' },
  { type: POWER_TYPES.SHIELD, texture: 'powerShield' },
  { type: POWER_TYPES.MULTI, texture: 'powerMulti' },
];

/**
 * Power-up capsule that drifts down. The player collects it by touching it.
 */
export class PowerUp {
  constructor(scene, x, y) {
    this.scene = scene;
    const choice = POWER_KEYS[Math.floor(Math.random() * POWER_KEYS.length)];
    this.type = choice.type;
    this.sprite = scene.physics.add.sprite(x, y, choice.texture);
    this.sprite.setDepth(12);
    this.sprite.ownerPowerUp = this;
    this.sprite.setVelocityY(FALL_SPEED);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  update() {
    if (this.sprite.y > this.scene.scale.height + 40) {
      this.destroy();
    }
  }

  destroy() {
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}

/**
 * Occasionally award an extra life instead of a power-up.
 */
export class ExtraLife {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'cyanGlow');
    this.sprite.setDepth(12).setTint(0x34d399).setScale(0.8);
    this.sprite.ownerExtraLife = this;
    this.sprite.setVelocityY(FALL_SPEED);
    // Draw a heart-ish marker on top.
    this.label = scene.add.text(x, y, '+1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(13);
  }

  update() {
    if (this.label) this.label.setPosition(this.sprite.x, this.sprite.y);
    if (this.sprite.y > this.scene.scale.height + 40) this.destroy();
  }

  destroy() {
    if (this.label) this.label.destroy();
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}
