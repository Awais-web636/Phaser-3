import Phaser from 'phaser';
import { sound } from '../utils/sound.js';

const FIRE_RATE_NORMAL = 280;
const FIRE_RATE_RAPID = 110;
const FIRE_RATE_MULTI = 200;
const RAPID_DURATION = 6000;
const SHIELD_DURATION = 7000;
const MULTI_DURATION = 6000;
const INVULN_DURATION = 1600;
const PLAYER_SPEED = 320;

const POWER_TYPES = {
  RAPID: 'rapid',
  SHIELD: 'shield',
  MULTI: 'multi',
};

/**
 * The player's ship.
 *
 * Responsibilities: movement (keyboard + pointer), firing bullets, absorbing
 * power-ups, tracking lives, and reporting collisions via event callbacks.
 */
export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(28, 36, true);
    this.sprite.setDepth(20);

    this.lives = 3;
    this.maxLives = 3;
    this.lastFire = 0;
    this.fireRate = FIRE_RATE_NORMAL;
    this.power = POWER_TYPES.NONE;
    this.powerTimer = null;
    this.invulnerable = false;

    this.shieldGfx = scene.add.image(x, y, 'cyanGlow');
    this.shieldGfx.setDepth(19).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);

    this._setupInput();
    this._setupCursors();
  }

  _setupInput() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.fireKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  _setupCursors() {
    // WASD as an alternative to arrow keys.
    this.wasd = {
      left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };
  }

  update(time, delta, pointer) {
    this._handleMovement(pointer);
    this._handleFiring(time);
    this._updateShield();
  }

  _handleMovement(pointer) {
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) {
      this.sprite.setVelocityX(-PLAYER_SPEED);
    } else if (right) {
      this.sprite.setVelocityX(PLAYER_SPEED);
    } else {
      this.sprite.setVelocityX(0);
    }

    if (up) {
      this.sprite.setVelocityY(-PLAYER_SPEED);
    } else if (down) {
      this.sprite.setVelocityY(PLAYER_SPEED);
    } else {
      this.sprite.setVelocityY(0);
    }

    // Pointer/touch steering — move toward the pointer horizontally.
    if (pointer && pointer.isDown) {
      const dx = pointer.worldX - this.sprite.x;
      const dy = pointer.worldY - this.sprite.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 8) {
        const speed = Math.min(dist * 6, PLAYER_SPEED);
        this.sprite.setVelocity(
          (dx / dist) * speed,
          (dy / dist) * speed
        );
      } else {
        this.sprite.setVelocity(0, 0);
      }
    }

    // Banking visual.
    this.sprite.rotation = this.sprite.body.velocity.x * 0.0012;
  }

  _handleFiring(time) {
    if ((this.fireKey.isDown || (this.scene.input.activePointer && this.scene.input.activePointer.isDown))
        && time - this.lastFire > this.fireRate) {
      this.lastFire = time;
      this.fire();
    }
  }

  fire() {
    const x = this.sprite.x;
    const y = this.sprite.y - 30;
    if (this.power === POWER_TYPES.MULTI) {
      this.scene.spawnBullet(x, y, 0, -560);
      this.scene.spawnBullet(x - 14, y + 6, -120, -540);
      this.scene.spawnBullet(x + 14, y + 6, 120, -540);
    } else {
      this.scene.spawnBullet(x, y, 0, -560);
    }
    sound.shoot();
  }

  _updateShield() {
    if (this.power === POWER_TYPES.SHIELD) {
      this.shieldGfx.setVisible(true).setPosition(this.sprite.x, this.sprite.y);
    } else {
      this.shieldGfx.setVisible(false);
    }
  }

  /** Apply a picked-up power-up, starting or refreshing its timer. */
  applyPowerUp(type) {
    this.clearPower();
    this.power = type;
    sound.powerUp();
    let duration = RAPID_DURATION;
    if (type === POWER_TYPES.RAPID) {
      this.fireRate = FIRE_RATE_RAPID;
      duration = RAPID_DURATION;
    } else if (type === POWER_TYPES.MULTI) {
      this.fireRate = FIRE_RATE_MULTI;
      duration = MULTI_DURATION;
    } else if (type === POWER_TYPES.SHIELD) {
      duration = SHIELD_DURATION;
    }
    this.powerTimer = this.scene.time.delayedCall(duration, () => this.clearPower());
  }

  clearPower() {
    this.power = POWER_TYPES.NONE;
    this.fireRate = FIRE_RATE_NORMAL;
    if (this.powerTimer) {
      this.powerTimer.remove();
      this.powerTimer = null;
    }
  }

  /** Returns true if the hit was absorbed by a shield. */
  takeHit() {
    if (this.invulnerable) return false;
    if (this.power === POWER_TYPES.SHIELD) {
      sound.shieldHit();
      this.clearPower();
      return true;
    }
    this.lives -= 1;
    sound.playerHit();
    this._startInvuln();
    return false;
  }

  _startInvuln() {
    this.invulnerable = true;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.invulnerable = false;
        this.sprite.alpha = 1;
      },
    });
  }

  isDead() {
    return this.lives <= 0;
  }

  addLife() {
    if (this.lives < this.maxLives) this.lives += 1;
  }

  destroy() {
    this.clearPower();
    this.sprite.destroy();
    this.shieldGfx.destroy();
  }
}

export { POWER_TYPES };
