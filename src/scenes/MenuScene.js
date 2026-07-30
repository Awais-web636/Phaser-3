import Phaser from 'phaser';
import { Starfield } from './Starfield.js';
import { sound } from '../utils/sound.js';

const TITLE_FONT = { fontFamily: '"Arial Black", Impact, sans-serif', fontSize: '72px', color: '#ffffff', stroke: '#0ea5e9', strokeThickness: 6 };

/**
 * Title / instructions screen shown before the game begins.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.starfield = new Starfield(this);

    // Gradient-ish backdrop.
    const bg = this.add.rectangle(0, 0, w, h, 0x0b1021, 1).setOrigin(0).setDepth(-1);

    // Title.
    const title = this.add.text(w / 2, h * 0.28, 'STARFALL', TITLE_FONT).setOrigin(0.5).setDepth(5);
    title.setShadow(0, 0, '#38bdf8', 20, true, true);
    this.tweens.add({
      targets: title,
      scale: { from: 0.8, to: 1 },
      duration: 700,
      ease: 'Back.out',
    });

    // Subtitle.
    this.add.text(w / 2, h * 0.28 + 70, 'A Phaser 3 Space Shooter', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#94a3b8',
    }).setOrigin(0.5).setDepth(5);

    // Controls panel.
    const panelW = Math.min(420, w - 60);
    const panelX = w / 2 - panelW / 2;
    const panelY = h * 0.48;
    const panel = this.add.rectangle(panelX, panelY, panelW, 210, 0x111a2e, 0.85)
      .setOrigin(0, 0).setDepth(4).setStrokeStyle(2, 0x1e3a5f);

    this.add.text(w / 2, panelY + 22, 'HOW TO PLAY', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#38bdf8', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5);

    const lines = [
      'Move: Arrow Keys / WASD / Drag',
      'Fire: Space / Click / Tap',
      '',
      'Destroy enemy ships and survive waves.',
      'Grab power-ups for rapid fire, shields,',
      'and spread shot. Beat the boss to win!',
    ];
    lines.forEach((line, i) => {
      this.add.text(w / 2, panelY + 60 + i * 22, line, {
        fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#cbd5e1',
      }).setOrigin(0.5).setDepth(5);
    });

    // Start button.
    const btnW = 220;
    const btnH = 56;
    const btn = this.add.rectangle(w / 2, h * 0.82, btnW, btnH, 0x0ea5e9)
      .setStrokeStyle(2, 0x7dd3fc).setDepth(5);
    btn.setInteractive({ useHandCursor: true });
    const btnLabel = this.add.text(w / 2, h * 0.82, 'START', {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: 'bold',
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

    // Pulsing prompt.
    this.add.text(w / 2, h * 0.82 + 52, 'Press SPACE or click to begin', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#64748b',
    }).setOrigin(0.5).setDepth(5).setAlpha(0.7);

    this.input.keyboard.once('keydown-SPACE', () => {
      sound.resume();
      this.scene.start('Game');
    });
    // Mute hint.
    this.add.text(w - 12, h - 12, 'M: mute   P: pause', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#475569',
    }).setOrigin(1, 1).setDepth(5);

    this.scale.on('resize', this._onResize, this);
  }

  _onResize(gameSize) {
    // Simple re-layout: restart the menu so elements reposition.
    if (this.scene.isActive()) {
      this.scene.restart();
    }
  }

  _quitGame() {
    try {
      window.location.reload();
    } catch (error) {
      // Ignore reload errors and keep the menu visible.
    }
  }

  update(time, delta) {
    this.starfield.update(delta);
  }

  shutdown() {
    this.scale.off('resize', this._onResize, this);
    if (this.starfield) this.starfield.destroy();
  }
}
