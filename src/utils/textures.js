import Phaser from 'phaser';

/**
 * Procedural texture generation.
 *
 * Every sprite in the game is drawn to an offscreen canvas at boot time
 * and registered as a Phaser texture. This keeps the build tiny (no binary
 * asset files) while still producing crisp, good-looking artwork.
 */

const PARTICLE_RADIUS = 16;

function makeCircle(ctx, cx, cy, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

/** Create a soft radial glow texture used for backgrounds and effects. */
function createGlow(scene, key, radius, innerColor) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  const size = radius * 2;
  const steps = 24;
  for (let i = steps; i > 0; i--) {
    const t = i / steps;
    const r = Math.max(1, (radius * i) / steps);
    const alpha = 0.65 * (1 - t) * 0.5;
    g.fillStyle(innerColor, alpha);
    g.fillCircle(radius, radius, r);
  }
  g.generateTexture(key, size, size);
  g.destroy();
}

/**
 * Player ship — a sleek arrow-shaped vessel pointing upward.
 */
function createPlayerTexture(scene) {
  const w = 64;
  const h = 80;
  const canvas = scene.textures.createCanvas('player', w, h);
  const ctx = canvas.getContext();

  // Engine glow at the rear.
  const glow = ctx.createRadialGradient(w / 2, h - 8, 2, w / 2, h - 8, 26);
  glow.addColorStop(0, 'rgba(94, 234, 212, 0.9)');
  glow.addColorStop(1, 'rgba(94, 234, 212, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Body — arrow silhouette.
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(w / 2, 4);
  ctx.lineTo(w - 10, h - 18);
  ctx.lineTo(w / 2, h - 26);
  ctx.lineTo(10, h - 18);
  ctx.closePath();
  ctx.fill();

  // Body highlight.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(w / 2, 8);
  ctx.lineTo(w / 2 + 6, h - 22);
  ctx.lineTo(w / 2, h - 28);
  ctx.lineTo(w / 2 - 6, h - 22);
  ctx.closePath();
  ctx.fill();

  // Cockpit.
  makeCircle(ctx, w / 2, h - 40, 7, '#38bdf8');
  makeCircle(ctx, w / 2 - 2, h - 42, 3, '#bae6fd');

  // Wing accents.
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(8, h - 22, 10, 5);
  ctx.fillRect(w - 18, h - 22, 10, 5);

  canvas.refresh();
}

/**
 * Bullet — a glowing energy projectile.
 */
function createBulletTexture(scene) {
  const w = 12;
  const h = 28;
  const canvas = scene.textures.createCanvas('bullet', w, h);
  const ctx = canvas.getContext();

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(186, 230, 253, 1)');
  grad.addColorStop(0.5, 'rgba(56, 189, 248, 1)');
  grad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');
  ctx.fillStyle = grad;
  roundRect(ctx, 3, 2, w - 6, h - 4, 4);
  ctx.fill();

  // Bright core.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  roundRect(ctx, w / 2 - 1.5, 4, 3, h - 8, 2);
  ctx.fill();

  canvas.refresh();
}

/**
 * Enemy bullet — a reddish orb fired by some enemies.
 */
function createEnemyBulletTexture(scene) {
  const w = 16;
  const h = 16;
  const canvas = scene.textures.createCanvas('enemyBullet', w, h);
  const ctx = canvas.getContext();

  const grad = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2);
  grad.addColorStop(0, 'rgba(254, 226, 226, 1)');
  grad.addColorStop(0.5, 'rgba(248, 113, 113, 1)');
  grad.addColorStop(1, 'rgba(220, 38, 38, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
  ctx.fill();

  canvas.refresh();
}

/**
 * Basic grunt enemy — a small menacing drone.
 */
function createGruntTexture(scene) {
  const w = 52;
  const h = 48;
  const canvas = scene.textures.createCanvas('grunt', w, h);
  const ctx = canvas.getContext();

  // Body.
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 6);
  ctx.lineTo(w - 4, 12);
  ctx.quadraticCurveTo(w / 2, 2, 4, 12);
  ctx.closePath();
  ctx.fill();

  // Wings.
  ctx.fillStyle = '#9f1239';
  ctx.beginPath();
  ctx.moveTo(4, 12);
  ctx.lineTo(2, 22);
  ctx.lineTo(14, 18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w - 4, 12);
  ctx.lineTo(w - 2, 22);
  ctx.lineTo(w - 14, 18);
  ctx.closePath();
  ctx.fill();

  // Eye.
  makeCircle(ctx, w / 2, 20, 8, '#fef2f2');
  makeCircle(ctx, w / 2, 20, 5, '#7f1d1d');
  makeCircle(ctx, w / 2 - 2, 18, 2, '#ffffff');

  canvas.refresh();
}

/**
 * Zigzag enemy — a fast, erratic attacker.
 */
function createZigzagTexture(scene) {
  const w = 48;
  const h = 44;
  const canvas = scene.textures.createCanvas('zigzag', w, h);
  const ctx = canvas.getContext();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 4);
  ctx.lineTo(w - 6, h / 2);
  ctx.lineTo(w / 2, 6);
  ctx.lineTo(6, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 8);
  ctx.lineTo(w - 10, h / 2);
  ctx.lineTo(w / 2, 10);
  ctx.lineTo(10, h / 2);
  ctx.closePath();
  ctx.fill();

  makeCircle(ctx, w / 2, h / 2, 6, '#fffbeb');
  makeCircle(ctx, w / 2, h / 2, 3, '#78350f');

  canvas.refresh();
}

/**
 * Tank enemy — a slow, heavily armored bruiser with a shield.
 */
function createTankTexture(scene) {
  const w = 64;
  const h = 56;
  const canvas = scene.textures.createCanvas('tank', w, h);
  const ctx = canvas.getContext();

  // Shield ring.
  ctx.strokeStyle = 'rgba(167, 243, 208, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w / 2 - 2, 0, Math.PI * 2);
  ctx.stroke();

  // Body.
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 4);
  ctx.lineTo(w - 8, h - 16);
  ctx.lineTo(w - 12, 12);
  ctx.lineTo(w / 2, 4);
  ctx.lineTo(12, 12);
  ctx.lineTo(8, h - 16);
  ctx.closePath();
  ctx.fill();

  // Armor plates.
  ctx.fillStyle = '#365314';
  ctx.fillRect(14, h - 22, w - 28, 8);
  ctx.fillRect(20, 14, w - 40, 6);

  // Core.
  makeCircle(ctx, w / 2, h / 2, 8, '#1a2e05');
  makeCircle(ctx, w / 2, h / 2, 4, '#a3e635');

  canvas.refresh();
}

/**
 * Boss — a large multi-part adversary appearing at the end of each wave.
 */
function createBossTexture(scene) {
  const w = 160;
  const h = 120;
  const canvas = scene.textures.createCanvas('boss', w, h);
  const ctx = canvas.getContext();

  // Aura.
  const aura = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
  aura.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
  aura.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, w, h);

  // Main hull.
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 6);
  ctx.lineTo(w - 10, h - 30);
  ctx.lineTo(w - 20, 20);
  ctx.lineTo(w / 2, 6);
  ctx.lineTo(20, 20);
  ctx.lineTo(10, h - 30);
  ctx.closePath();
  ctx.fill();

  // Hull shading.
  ctx.fillStyle = '#5b21b6';
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 10);
  ctx.lineTo(w - 16, h - 32);
  ctx.lineTo(w - 24, 24);
  ctx.lineTo(w / 2, 12);
  ctx.closePath();
  ctx.fill();

  // Cannon pods.
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(18, h - 36, 20, 16);
  ctx.fillRect(w - 38, h - 36, 20, 16);

  // Central reactor.
  makeCircle(ctx, w / 2, h / 2, 18, '#ede9fe');
  makeCircle(ctx, w / 2, h / 2, 12, '#a855f7');
  makeCircle(ctx, w / 2, h / 2, 6, '#ffffff');

  canvas.refresh();
}

/**
 * Explosion particle — a glowing ember of varying hue.
 */
function createParticleTexture(scene) {
  const size = PARTICLE_RADIUS * 2;
  const canvas = scene.textures.createCanvas('particle', size, size);
  const ctx = canvas.getContext();
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.4, 'rgba(251, 191, 36, 1)');
  grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  canvas.refresh();
}

/**
 * Power-up capsules.
 */
function createPowerUpTextures(scene) {
  const configs = [
    { key: 'powerRapid', color: '#22d3ee', icon: 'R' },
    { key: 'powerShield', color: '#34d399', icon: 'S' },
    { key: 'powerMulti', color: '#fbbf24', icon: 'M' },
  ];

  configs.forEach(({ key, color, icon }) => {
    const w = 36;
    const h = 36;
    const canvas = scene.textures.createCanvas(key, w, h);
    const ctx = canvas.getContext();

    const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 13, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, w / 2, h / 2 + 1);
    canvas.refresh();
  });
}

/**
 * Star background — three layers of differently sized stars.
 */
function createStarTextures(scene) {
  const sizes = [
    { key: 'star1', size: 2, color: 'rgba(255,255,255,0.5)' },
    { key: 'star2', size: 3, color: 'rgba(199, 210, 254, 0.8)' },
    { key: 'star3', size: 4, color: 'rgba(255,255,255,1)' },
  ];

  sizes.forEach(({ key, size, color }) => {
    const s = size * 2;
    const canvas = scene.textures.createCanvas(key, s, s);
    const ctx = canvas.getContext();
    makeCircle(ctx, s / 2, s / 2, size, color);
    canvas.refresh();
  });
}

/** Rounded-rectangle helper. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Generate every texture the game needs. Call once during the Boot scene.
 */
export function generateAllTextures(scene) {
  createGlow(scene, 'cyanGlow', 64, '#5eead4');
  createPlayerTexture(scene);
  createBulletTexture(scene);
  createEnemyBulletTexture(scene);
  createGruntTexture(scene);
  createGruntTexture.usesInner = false;
  createZigzagTexture(scene);
  createTankTexture(scene);
  createBossTexture(scene);
  createParticleTexture(scene);
  createPowerUpTextures(scene);
  createStarTextures(scene);
}
