import Phaser from 'phaser';
import { Starfield } from './Starfield.js';
import { sound } from '../utils/sound.js';

/**
 * End-of-game screen. Shows a victory or defeat banner, the final score,
 * and a restart button.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.win = data && data.win;
    this.finalScore = (data && data.score) || 0;
    this.finalWave = (data && data.wave) || 1;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.starfield = new Starfield(this);

    this.add.rectangle(0, 0, w, h, this.win ? 0x051a14 : 0x1a0808, 0.92).setOrigin(0).setDepth(-1);

    const banner = this.win ? 'VICTORY!' : 'GAME OVER';
    const color = this.win ? '#34d399' : '#f87171';
    const stroke = this.win ? '#065f46' : '#7f1d1d';

    const title = this.add.text(w / 2, h * 0.32, banner, {
      fontFamily: '"Arial Black", Impact, sans-serif',
      fontSize: '64px',
      color,
      stroke,
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: title, scale: { from: 0.6, to: 1 }, duration: 600, ease: 'Back.out' });

    this.add.text(w / 2, h * 0.32 + 60, this.win
      ? 'You defeated the enemy fleet!'
      : 'Your ship was lost in battle.', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(5);

    // Stats panel.
    this.add.text(w / 2, h * 0.55, `SCORE  ${this.finalScore}`, {
      fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '34px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(5);

    this.add.text(w / 2, h * 0.55 + 40, `WAVE REACHED  ${this.finalWave}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#94a3b8',
    }).setOrigin(0.5).setDepth(5);

    // Restart button.
    const btn = this.add.rectangle(w / 2, h * 0.75, 220, 56, 0x0ea5e9)
      .setStrokeStyle(2, 0x7dd3fc).setDepth(5);
    btn.setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(w / 2, h * 0.75, 'PLAY AGAIN', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    btn.on('pointerover', () => btn.setFillStyle(0x38bdf8));
    btn.on('pointerout', () => btn.setFillStyle(0x0ea5e9));
    btn.on('pointerdown', () => {
      sound.resume();
      this.tweens.add({
        targets: [btn, btnLabel],
        scale: 0.92,
        duration: 80,
        yoyo: true,
        onComplete: () => this.scene.start('Game'),
      });
    });

    this.add.text(w / 2, h * 0.75 + 52, 'Press SPACE to restart', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#64748b',
    }).setOrigin(0.5).setDepth(5);

    this.input.keyboard.once('keydown-SPACE', () => {
      sound.resume();
      this.scene.start('Game');
    });

    // Back to menu on ESC.
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));

    this.scale.on('resize', this._onResize, this);
  }

  _onResize() {
    if (this.scene.isActive()) this.scene.restart({ win: this.win, score: this.finalScore, wave: this.finalWave });
  }

  update(time, delta) {
    this.starfield.update(delta);
  }

  shutdown() {
    this.scale.off('resize', this._onResize, this);
    if (this.starfield) this.starfield.destroy();
  }
}
