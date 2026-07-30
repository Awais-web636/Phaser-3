import Phaser from 'phaser';
import { sound } from '../utils/sound.js';

/**
 * Particle-driven explosion effect.
 *
 * Uses a single particle emitter per explosion, auto-destroying when the
 * burst completes. A quick screen flash is layered on top for impact.
 */
export class Explosion {
  constructor(scene, x, y, scale = 1, big = false) {
    this.scene = scene;

    const emitter = scene.add.particles(x, y, 'particle', {
      speed: { min: 80 * scale, max: 240 * scale },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8 * scale, end: 0 },
      lifespan: big ? 700 : 450,
      quantity: big ? 24 : 12,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.setDepth(25);
    emitter.explode(big ? 28 : 16);
    scene.time.delayedCall(big ? 800 : 500, () => emitter.destroy());

    // Flash.
    const flash = scene.add.image(x, y, 'cyanGlow').setDepth(24).setScale(scale * 2).setAlpha(0.8);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: scale * 3,
      duration: big ? 350 : 200,
      onComplete: () => flash.destroy(),
    });

    if (big) sound.bigExplosion();
    else sound.explosion();
  }
}
