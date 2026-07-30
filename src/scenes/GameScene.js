import Phaser from 'phaser';
import { Player, POWER_TYPES } from '../objects/Player.js';
import { BulletPool } from '../objects/BulletPool.js';
import { EnemyBulletPool } from '../objects/EnemyBulletPool.js';
import { Enemy, ENEMY_TYPES } from '../objects/Enemy.js';
import { PowerUp, ExtraLife } from '../objects/PowerUp.js';
import { Explosion } from '../objects/Explosion.js';
import { Starfield } from './Starfield.js';
import { HUD } from './HUD.js';
import { sound } from '../utils/sound.js';

const TOTAL_WAVES = 5;
const POWERUP_CHANCE = 0.22;
const EXTRA_LIFE_CHANCE = 0.04;

/**
 * Core gameplay scene.
 *
 * Owns the player, bullet pools, enemy roster, power-ups, collisions, the
 * HUD, and the wave director. The wave director schedules enemy spawns
 * per wave and spawns a boss at the end of the final wave.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.score = 0;
    this.wave = 0;
    this.gameOver = false;
    this.paused = false;
    this.enemies = [];
    this.powerUps = [];
    this.boss = null;
    this.waveActive = false;
    this.spawnQueue = [];
    this.spawnTimer = null;
    this.exitOverlay = null;

    this.starfield = new Starfield(this);
    this.hud = new HUD(this);

    // Backdrop.
    this.add.rectangle(0, 0, w, h, 0x0b1021, 1).setOrigin(0).setDepth(-1);

    this.player = new Player(this, w / 2, h - 90);
    this.bullets = new BulletPool(this);
    this.enemyBullets = new EnemyBulletPool(this);

    this._setupCollisions();
    this._setupInput();

    this.scale.on('resize', this._onResize, this);

    // Begin the first wave shortly after entry.
    this.time.delayedCall(700, () => this._startWave(1));
  }

  _setupCollisions() {
    this.physics.add.overlap(this.bullets.group, this.enemyBullets.group, (b, eb) => {
      this.bullets.kill(b);
      this.enemyBullets.kill(eb);
      new Explosion(this, b.x, b.y, 0.4);
    });

    this.physics.add.overlap(this.player.sprite, this.enemyBullets.group, (_p, eb) => {
      if (!eb.active) return;
      this.enemyBullets.kill(eb);
      this._playerHit();
    });
  }

  _setupInput() {
    this.input.keyboard.on('keydown-P', () => this._togglePause());
    this.input.keyboard.on('keydown-ESC', () => this._togglePause());
    this.input.keyboard.on('keydown-Q', () => this._requestExit());
    this.input.keyboard.on('keydown-M', () => {
      const on = sound.toggleMute();
      this._showToast(on ? 'SOUND ON' : 'SOUND OFF');
    });
  }

  _togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.tweens.pauseAll();
      this._showPauseOverlay();
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this._hidePauseOverlay();
    }
  }

  _showPauseOverlay() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.pauseOverlay = this.add.container(0, 0).setDepth(100);
    const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.6).setOrigin(0);
    const text = this.add.text(w / 2, h / 2, 'PAUSED', {
      fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '48px', color: '#ffffff',
    }).setOrigin(0.5);
    const hint = this.add.text(w / 2, h / 2 + 50, 'Press P or ESC to resume', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#94a3b8',
    }).setOrigin(0.5);
    this.pauseOverlay.add([dim, text, hint]);
  }

  _hidePauseOverlay() {
    if (this.pauseOverlay) { this.pauseOverlay.destroy(); this.pauseOverlay = null; }
  }

  _requestExit() {
    if (this.gameOver || this.exitOverlay) return;
    this.paused = true;
    this.physics.pause();
    this.tweens.pauseAll();
    this.exitOverlay = this.add.container(0, 0).setDepth(120);

    const w = this.scale.width;
    const h = this.scale.height;
    const dim = this.add.rectangle(0, 0, w, h, 0x000000, 0.7).setOrigin(0);
    const panel = this.add.rectangle(w / 2, h / 2 - 8, 260, 140, 0x111827, 0.95)
      .setStrokeStyle(2, 0x38bdf8);
    const title = this.add.text(w / 2, h / 2 - 30, 'EXIT GAME?', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const sub = this.add.text(w / 2, h / 2 + 4, 'Press Y to confirm or N to cancel', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#cbd5e1',
    }).setOrigin(0.5);

    const yes = this.add.rectangle(w / 2 - 70, h / 2 + 42, 100, 40, 0x0ea5e9)
      .setInteractive({ useHandCursor: true });
    const yesLabel = this.add.text(w / 2 - 70, h / 2 + 42, 'YES', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    const no = this.add.rectangle(w / 2 + 70, h / 2 + 42, 100, 40, 0x334155)
      .setInteractive({ useHandCursor: true });
    const noLabel = this.add.text(w / 2 + 70, h / 2 + 42, 'NO', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    yes.on('pointerdown', () => this._confirmExit());
    no.on('pointerdown', () => this._cancelExit());

    this.exitOverlay.add([dim, panel, title, sub, yes, yesLabel, no, noLabel]);

    this.input.keyboard.once('keydown-Y', () => this._confirmExit());
    this.input.keyboard.once('keydown-N', () => this._cancelExit());
    this.input.keyboard.once('keydown-ESC', () => this._cancelExit());
  }

  _cancelExit() {
    if (!this.exitOverlay) return;
    this.exitOverlay.destroy();
    this.exitOverlay = null;
    this.paused = false;
    this.physics.resume();
    this.tweens.resumeAll();
  }

  _confirmExit() {
    this._cancelExit();
    this._returnToMenu();
  }

  _returnToMenu() {
    this.paused = false;
    this.gameOver = true;
    this.waveActive = false;
    this._cleanupForExit();
    this.scene.start('Menu');
  }

  _cleanupForExit() {
    if (this.exitOverlay) {
      this.exitOverlay.destroy();
      this.exitOverlay = null;
    }
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }

    this.time.removeAllEvents();
    this.tweens.killAll();
    this.input.keyboard.removeAllListeners();

    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }

    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.bullets) {
      this.bullets.destroy();
      this.bullets = null;
    }
    if (this.enemyBullets) {
      this.enemyBullets.destroy();
      this.enemyBullets = null;
    }
    if (this.starfield) {
      this.starfield.destroy();
      this.starfield = null;
    }
    if (this.hud) {
      this.hud.destroy();
      this.hud = null;
    }

    this.enemies.forEach((enemy) => enemy.destroy());
    this.enemies = [];
    this.powerUps.forEach((powerUp) => powerUp.destroy());
    this.powerUps = [];
    this.boss = null;
  }

  _showToast(msg) {
    const w = this.scale.width;
    const toast = this.add.text(w / 2, 60, msg, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#ffffff', backgroundColor: '#1e293b',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({
      targets: toast,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 800,
      onComplete: () => toast.destroy(),
    });
  }

  // ---- Wave director ----------------------------------------------------

  _startWave(n) {
    this.wave = n;
    this.waveActive = true;
    this.hud.setWave(n);
    this._showToast(`WAVE ${n}`);

    if (n === TOTAL_WAVES) {
      this._spawnBoss();
      return;
    }

    this.spawnQueue = this._buildWave(n);
    this._scheduleNextSpawn();
  }

  _buildWave(n) {
    const queue = [];
    const rows = 2 + n;
    const cols = 6 + Math.min(n, 2);
    const w = this.scale.width;
    const spacing = Math.min(80, (w - 120) / cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (w - spacing * (cols - 1)) / 2 + c * spacing;
        const y = 60 + r * 56;
        let type = 'grunt';
        const roll = Math.random();
        if (n >= 2 && roll > 0.7) type = 'zigzag';
        if (n >= 3 && roll > 0.9) type = 'tank';
        queue.push({ type, x, y, delay: r * 180 + c * 60 });
      }
    }
    // Shuffle slightly so formations aren't perfectly ordered.
    return queue.sort((a, b) => a.delay - b.delay);
  }

  _scheduleNextSpawn() {
    if (this.spawnQueue.length === 0) {
      // Wait until all enemies cleared to advance.
      this._checkWaveComplete();
      return;
    }
    const next = this.spawnQueue.shift();
    this.spawnTimer = this.time.delayedCall(Math.max(40, next.delay % 400), () => {
      if (!this.gameOver && !this.paused) {
        this._spawnEnemy(next.type, next.x, next.y);
      }
      this._scheduleNextSpawn();
    });
  }

  _spawnEnemy(type, x, y) {
    const enemy = new Enemy(this, type, x, y, (ex, ey, vx, vy) => {
      this.enemyBullets.spawn(ex, ey, vx, vy);
    });
    this.enemies.push(enemy);
    this.physics.add.overlap(this.bullets.group, enemy.sprite, (bullet, esprite) => {
      if (!bullet.active || !esprite.active) return;
      this.bullets.kill(bullet);
      const killed = enemy.damage(1);
      if (killed) {
        this.score += enemy.config.score;
        this.hud.setScore(this.score);
      }
    });
  }

  _spawnBoss() {
    const w = this.scale.width;
    this.boss = new Enemy(this, 'boss', w / 2, -100, (ex, ey, vx, vy) => {
      this.enemyBullets.spawn(ex, ey, vx, vy);
    });
    this.enemies.push(this.boss);
    this.hud.showBossBar();
    // Boss descends into view.
    this.tweens.add({
      targets: this.boss.sprite,
      y: 110,
      duration: 1400,
      ease: 'Sine.out',
    });
    this.physics.add.overlap(this.bullets.group, this.boss.sprite, (bullet, esprite) => {
      if (!bullet.active || !esprite.active) return;
      this.bullets.kill(bullet);
      const killed = this.boss.damage(1);
      this.hud.setBossHealth(this.boss.health / this.boss.maxHealth);
      if (killed) {
        this.score += this.boss.config.score;
        this.hud.setScore(this.score);
        this.hud.hideBossBar();
      }
    });
  }

  _checkWaveComplete() {
    if (this.gameOver || !this.waveActive) return;
    // Wave is complete once the spawn queue is empty and no enemies remain.
    if (this.spawnQueue.length === 0 && this.enemies.length === 0 && !this.boss) {
      this.waveActive = false;
      if (this.wave >= TOTAL_WAVES) {
        this._victory();
      } else {
        this.time.delayedCall(1200, () => this._startWave(this.wave + 1));
      }
    }
  }

  // ---- Public hooks used by game objects -------------------------------

  spawnBullet(x, y, vx, vy) {
    this.bullets.spawn(x, y, vx, vy);
  }

  onEnemyDestroyed(enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx >= 0) this.enemies.splice(idx, 1);
    const big = enemy.type === 'tank' || enemy.type === 'boss';
    new Explosion(this, enemy.sprite.x, enemy.sprite.y, big ? 2.2 : 1, big);

    if (enemy.type === 'boss') {
      this.boss = null;
      this.hud.hideBossBar();
      this.waveActive = false;
      this.time.delayedCall(300, () => this._victory());
      return;
    }

    // Drop chance.
    if (Math.random() < POWERUP_CHANCE) {
      this.powerUps.push(new PowerUp(this, enemy.sprite.x, enemy.sprite.y));
    } else if (Math.random() < EXTRA_LIFE_CHANCE) {
      this.powerUps.push(new ExtraLife(this, enemy.sprite.x, enemy.sprite.y));
    }

    this.time.delayedCall(100, () => this._checkWaveComplete());
  }

  // ---- Player damage ----------------------------------------------------

  _playerHit() {
    const absorbed = this.player.takeHit();
    if (!absorbed) {
      new Explosion(this, this.player.sprite.x, this.player.sprite.y, 1.2);
    }
    this.hud.setLives(this.player.lives);
    if (this.player.isDead()) {
      this._endGame(false);
    }
  }

  // ---- End states -------------------------------------------------------

  _victory() {
    this.gameOver = true;
    sound.victory();
    this.time.delayedCall(800, () => this.scene.start('GameOver', { win: true, score: this.score, wave: this.wave }));
  }

  _endGame(win) {
    if (this.gameOver) return;
    this.gameOver = true;
    sound.gameOver();
    // Big explosion on player.
    new Explosion(this, this.player.sprite.x, this.player.sprite.y, 3, true);
    this.player.sprite.setVisible(false);
    this.time.delayedCall(900, () => {
      this.scene.start('GameOver', { win, score: this.score, wave: this.wave });
    });
  }

  // ---- Per-frame update -------------------------------------------------

  update(time, delta) {
    if (this.gameOver || this.paused) return;

    this.starfield.update(delta);
    this.player.update(time, delta, this.input.activePointer);
    this.bullets.update();
    this.enemyBullets.update();

    // Update enemies.
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(time, delta);
      if (!e.alive) {
        this.enemies.splice(i, 1);
        continue;
      }
      // Enemy reaches the bottom — penalize the player.
      if (e.type !== 'boss' && e.sprite.y > this.scale.height + 30) {
        e.destroy();
        this.enemies.splice(i, 1);
        this._playerHit();
      }
    }

    // Power-ups.
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.update();
      if (!p.sprite || !p.sprite.active) {
        this.powerUps.splice(i, 1);
        continue;
      }
      this.physics.world.overlap(this.player.sprite, p.sprite, () => {
        if (p instanceof ExtraLife) {
          this.player.addLife();
          this.hud.setLives(this.player.lives);
          this._showToast('+1 LIFE');
        } else {
          this.player.applyPowerUp(p.type);
          this.hud.setPower(this._powerLabel(p.type));
          this.time.delayedCall(6500, () => this.hud.setPower(''));
        }
        p.destroy();
        this.powerUps.splice(i, 1);
      });
    }

    // Player vs enemy body collision.
    this.enemies.forEach((e) => {
      if (!e.sprite.active) return;
      this.physics.world.overlap(this.player.sprite, e.sprite, () => {
        if (this.player.invulnerable) return;
        if (e.type !== 'boss') {
          e.die();
        }
        this._playerHit();
      });
    });

    // Update boss health bar smoothly.
    if (this.boss && this.boss.alive) {
      this.hud.setBossHealth(this.boss.health / this.boss.maxHealth);
    }

    // HUD power timer label.
    if (this.player.power !== POWER_TYPES.NONE) {
      const remaining = this.player.powerTimer ? Math.ceil(this.player.powerTimer.getRemaining() / 1000) : 0;
      this.hud.setPower(`${this._powerLabel(this.player.power)}  ${remaining}s`);
    } else {
      this.hud.setPower('');
    }
  }

  _powerLabel(type) {
    switch (type) {
      case POWER_TYPES.RAPID: return 'RAPID FIRE';
      case POWER_TYPES.SHIELD: return 'SHIELD';
      case POWER_TYPES.MULTI: return 'SPREAD SHOT';
      default: return '';
    }
  }

  _onResize(gameSize) {
    if (this.hud) this.hud.resize();
  }

  shutdown() {
    this.scale.off('resize', this._onResize, this);
    this._cleanupForExit();
  }
}
