import Phaser from 'phaser';

/**
 * Heads-up display — score, lives, wave, and active power-up indicator.
 *
 * Rendered as DOM-free Phaser text/image objects so it scales with the
 * game canvas.
 */
export class HUD {
  constructor(scene) {
    this.scene = scene;

    this.scoreText = scene.add.text(16, 14, 'SCORE  0', {
      fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '22px', color: '#ffffff',
    }).setDepth(30).setScrollFactor(0);

    this.waveText = scene.add.text(16, 40, 'WAVE  1', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#94a3b8',
    }).setDepth(30).setScrollFactor(0);

    this.livesLabel = scene.add.text(16, 62, 'LIVES', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#64748b',
    }).setDepth(30).setScrollFactor(0);
    this.lifeIcons = [];
    this._refreshLives(3);

    this.powerText = scene.add.text(scene.scale.width - 16, 14, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#34d399',
    }).setOrigin(1, 0).setDepth(30).setScrollFactor(0);

    this.bossBarBg = null;
    this.bossBar = null;
  }

  _refreshLives(lives) {
    this.lifeIcons.forEach((ic) => ic.destroy());
    this.lifeIcons = [];
    for (let i = 0; i < lives; i++) {
      const ic = this.scene.add.image(20 + i * 22, 90, 'player').setOrigin(0, 0.5)
        .setScale(0.32).setDepth(30).setScrollFactor(0);
      this.lifeIcons.push(ic);
    }
  }

  setScore(score) {
    this.scoreText.setText(`SCORE  ${score}`);
  }

  setWave(wave) {
    this.waveText.setText(`WAVE  ${wave}`);
  }

  setLives(lives) {
    this._refreshLives(lives);
  }

  setPower(text) {
    this.powerText.setText(text);
    this.powerText.x = this.scene.scale.width - 16;
  }

  showBossBar() {
    const w = this.scene.scale.width;
    if (this.bossBarBg) return;
    this.bossBarBg = this.scene.add.rectangle(w / 2, 28, w * 0.5, 10, 0x1e293b)
      .setStrokeStyle(1, 0x475569).setDepth(31).setScrollFactor(0);
    this.bossBar = this.scene.add.rectangle(w / 2 - w * 0.25, 28, w * 0.5, 8, 0xa855f7)
      .setOrigin(0, 0.5).setDepth(32).setScrollFactor(0);
  }

  setBossHealth(ratio) {
    if (!this.bossBar) return;
    const w = this.scene.scale.width;
    this.bossBar.width = w * 0.5 * Phaser.Math.Clamp(ratio, 0, 1);
  }

  hideBossBar() {
    if (this.bossBarBg) { this.bossBarBg.destroy(); this.bossBarBg = null; }
    if (this.bossBar) { this.bossBar.destroy(); this.bossBar = null; }
  }

  resize() {
    this.powerText.x = this.scene.scale.width - 16;
    if (this.bossBarBg) {
      const w = this.scene.scale.width;
      this.bossBarBg.setPosition(w / 2, 28).setSize(w * 0.5, 10);
      this.bossBarBg.x = w / 2;
      this.bossBarBg.y = 28;
      this.bossBar.setPosition(w / 2 - w * 0.25, 28);
      this.bossBar.setSize(w * 0.5, 8);
    }
  }

  destroy() {
    [this.scoreText, this.waveText, this.livesLabel, this.powerText].forEach((t) => t.destroy());
    this.lifeIcons.forEach((ic) => ic.destroy());
    this.hideBossBar();
  }
}
