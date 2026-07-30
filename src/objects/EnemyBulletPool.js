/**
 * Enemy bullet pool — mirrors BulletPool but for hostile projectiles.
 */
export class EnemyBulletPool {
  constructor(scene, maxSize = 40) {
    this.scene = scene;
    this.group = scene.physics.add.group({
      maxSize,
      runChildUpdate: true,
    });
  }

  spawn(x, y, vx, vy) {
    let bullet = this.group.getFirstDead(false);
    if (!bullet) {
      bullet = this.scene.physics.add.sprite(x, y, 'enemyBullet');
      bullet.setDepth(14);
      this.group.add(bullet);
    }
    bullet.enableBody(true, x, y, true, true);
    bullet.setVelocity(vx, vy);
    bullet.body.setSize(12, 12, true);
    return bullet;
  }

  kill(bullet) {
    bullet.disableBody(true, true);
  }

  update() {
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
