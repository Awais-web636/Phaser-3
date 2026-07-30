import Phaser from 'phaser';

/**
 * Parallax starfield — three layers of stars scrolling at different speeds.
 */
export class Starfield {
  constructor(scene) {
    this.scene = scene;
    this.layers = [];
    const config = [
      { key: 'star1', speed: 30, count: 60, scale: 0.8 },
      { key: 'star2', speed: 70, count: 35, scale: 1 },
      { key: 'star3', speed: 130, count: 20, scale: 1.2 },
    ];
    config.forEach((c) => {
      const group = scene.add.group();
      for (let i = 0; i < c.count; i++) {
        const star = scene.add.image(
          Phaser.Math.Between(0, scene.scale.width),
          Phaser.Math.Between(0, scene.scale.height),
          c.key
        );
        star.setScrollFactor(0).setDepth(0).setScale(c.scale);
        star.speed = c.speed;
        group.add(star);
      }
      this.layers.push(group);
    });
  }

  update(delta) {
    const h = this.scene.scale.height;
    const w = this.scene.scale.width;
    this.layers.forEach((group) => {
      group.getChildren().forEach((star) => {
        star.y += (star.speed * delta) / 1000;
        if (star.y > h) {
          star.y = 0;
          star.x = Phaser.Math.Between(0, w);
        }
      });
    });
  }

  destroy() {
    this.layers.forEach((g) => g.clear(true, true));
  }
}
