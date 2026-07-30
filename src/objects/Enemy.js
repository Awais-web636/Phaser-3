import Phaser from 'phaser';
import { sound } from '../utils/sound.js';

const ENEMY_BULLET_SPEED = 240;

/**
 * Enemy configuration per type. Health, score value, fire chance and
 * movement behaviour live here so new enemy types can be added by
 * extending the table.
 */
export const ENEMY_TYPES = {
  grunt: {
    texture: 'grunt',
    health: 1,
    score: 100,
    speed: 130,
    canFire: false,
    movement: 'straight',
  },
  zigzag: {
    texture: 'zigzag',
    health: 1,
    score: 200,
    speed: 180,
    canFire: true,
    fireChance: 0.004,
    movement: 'zigzag',
  },
  tank: {
    texture: 'tank',
    health: 4,
    score: 400,
    speed: 80,
    canFire: true,
    fireChance: 0.006,
    movement: 'straight',
  },
  boss: {
    texture: 'boss',
    health: 40,
    score: 5000,
    speed: 60,
    canFire: true,
    fireChance: 0.02,
    movement: 'boss',
  },
};

/**
 * A single enemy instance wrapping a physics sprite.
 *
 * Movement patterns are chosen by the type's `movement` field. The enemy
 * fires via a callback the scene provides so bullets enter the scene's
 * enemy-bullet group.
 */
export class Enemy {
  constructor(scene, type, x, y, onFire) {
    this.scene = scene;
    this.type = type;
    this.config = ENEMY_TYPES[type];
    this.onFire = onFire;
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.alive = true;
    this.spawnX = x;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.diveTriggered = false;

    this.sprite = scene.physics.add.sprite(x, y, this.config.texture);
    this.sprite.setDepth(10);
    this.sprite.ownerEnemy = this;
  }

  update(time, delta) {
    if (!this.alive) return;
    const s = this.sprite;
    if (!s.active) return;

    switch (this.config.movement) {
      case 'straight':
        s.setVelocityY(this.config.speed);
        s.setVelocityX(0);
        break;
      case 'zigzag':
        s.setVelocityY(this.config.speed * 0.7);
        s.x = this.spawnX + Math.sin(time * 0.004 + this.bobOffset) * 120;
        s.setVelocityX(0);
        break;
      case 'boss':
        this._updateBoss(time);
        break;
    }

    // Firing.
    if (this.config.canFire && Math.random() < this.config.fireChance) {
      this._fire();
    }
  }

  _updateBoss(time) {
    const s = this.sprite;
    const w = this.scene.scale.width;
    // Boss stays near the top and sweeps horizontally.
    s.y = 110 + Math.sin(time * 0.0015) * 30;
    const targetX = w / 2 + Math.sin(time * 0.0012) * (w / 2 - 120);
    s.x = Phaser.Math.Linear(s.x, targetX, 0.04);
    s.setVelocity(0, 0);
  }

  _fire() {
    if (!this.sprite.active) return;
    const sx = this.sprite.x;
    const sy = this.sprite.y + this.sprite.height / 2;
    if (this.type === 'boss') {
      // Spread shot.
      this.onFire(sx - 24, sy, -90, ENEMY_BULLET_SPEED);
      this.onFire(sx, sy, 0, ENEMY_BULLET_SPEED);
      this.onFire(sx + 24, sy, 90, ENEMY_BULLET_SPEED);
    } else {
      // Aim at the player if present.
      const player = this.scene.player;
      let vx = 0;
      let vy = ENEMY_BULLET_SPEED;
      if (player && player.sprite.active) {
        const dx = player.sprite.x - sx;
        const dy = player.sprite.y - sy;
        const d = Math.hypot(dx, dy) || 1;
        vx = (dx / d) * ENEMY_BULLET_SPEED;
        vy = (dy / d) * ENEMY_BULLET_SPEED;
      }
      this.onFire(sx, sy, vx, vy);
    }
    sound.enemyShoot();
  }

  damage(amount = 1) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
      return true;
    }
    // Brief flash on hit.
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
    return false;
  }

  die() {
    this.alive = false;
    this.scene.onEnemyDestroyed(this);
    this.sprite.destroy();
  }

  isOffScreen() {
    return this.sprite.y > this.scene.scale.height + 100;
  }

  destroy() {
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}
