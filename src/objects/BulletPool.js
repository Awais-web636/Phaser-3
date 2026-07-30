import { sound } from '../utils/sound.js';

const SPEED = 560;

/**
 * Grouped bullet pool for the player's projectiles.
 *
 * Using a physics group with `runChildUpdate` lets us reuse inactive
 * sprites instead of allocating new ones on every shot.
 */
export class BulletPool {
  constructor(scene, maxSize = 60) {
    this.scene = scene;
    this.group = scene.physics.add.group({
      maxSize,
      runChildUpdate: true,
    });
  }

  spawn(x, y, vx, vy) {
    let bullet = this.group.getFirstDead(false);
    if (!bullet) {
      bullet = this.scene.physics.add.sprite(x, y, 'bullet');
      bullet.setDepth(15);
      bullet.setActive(true).setVisible(true);
      this.group.add(bullet);
    }
    bullet.enableBody(true, x, y, true, true);
    bullet.setVelocity(vx, vy);
    bullet.body.setSize(8, 20, true);
    bullet.lastEnemy = false;
    return bullet;
  }

  /** Kill a bullet and return it to the pool. */
  kill(bullet) {
    bullet.disableBody(true, true);
  }

  update() {
    // Cull bullets that have left the screen.
    this.group.getChildren().forEach((b) => {
      if (!b.active) return;
      if (b.y < -30 || b.y > this.scene.scale.height + 30 || b.x < -30 || b.x > this.scene.scale.width + 30) {
        this.kill(b);
      }
    });
  }

  destroy() {
    this.group.clear(true, true);
  }
}
