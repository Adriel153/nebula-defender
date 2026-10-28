/* NAVE DO JOGADOR. */
SD.Player = class {
  constructor() { this.reset(); }

  reset() {
    const C = SD.CONFIG, P = C.PLAYER;
    Object.assign(this, {
      x: C.WIDTH / 2, y: C.HEIGHT - 110, r: 12,
      lives: P.LIVES, bombs: P.BOMBS, weapon: 1,
      shield: 0, invuln: 0, fireTimer: 0,
      dead: false, tilt: 0, time: 0, entering: false
    });
  }

  /** Animação de entrada: a nave sobe de baixo da tela no início de cada fase. */
  enter() {
    this.x = SD.CONFIG.WIDTH / 2;
    this.y = SD.CONFIG.HEIGHT + 60;
    this.entering = true;
    this.invuln = 2.5;
  }

  update(dt, world) {
    const I = SD.Input, C = SD.CONFIG, P = C.PLAYER;
    this.time += dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.shield > 0) this.shield -= dt;

    if (this.entering) {
      this.y -= 380 * dt;
      if (this.y <= C.HEIGHT - 110) { this.y = C.HEIGHT - 110; this.entering = false; }
      SD.Particles.trail(this.x + (Math.random() - 0.5) * 6, this.y + 14, '#ffb347', 3, 140);
      return;
    }

    let dx = 0, dy = 0;
    if (I.down('left')) dx -= 1;
    if (I.down('right')) dx += 1;
    if (I.down('up')) dy -= 1;
    if (I.down('down')) dy += 1;
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
    this.x += dx * P.SPEED * dt;
    this.y += dy * P.SPEED * dt;

    let firing = I.down('fire');
    const t = I.touch;
    if (t.active) {                       // controle por toque/arrasto: segue o dedo + tiro automático
      const ddx = t.x - this.x, ddy = (t.y - 70) - this.y;
      const d = Math.hypot(ddx, ddy);
      if (d > 1) {
        const step = Math.min(d, P.SPEED * 1.6 * dt);
        this.x += ddx / d * step; this.y += ddy / d * step;
      }
      dx = SD.Utils.clamp(ddx / 30, -1, 1);
      firing = true;
    }

    this.tilt += (dx - this.tilt) * Math.min(1, dt * 10);   // inclinação suave ao virar
    this.x = SD.Utils.clamp(this.x, this.r, C.WIDTH - this.r);
    this.y = SD.Utils.clamp(this.y, this.r + 50, C.HEIGHT - this.r);

    if (Math.random() < 0.7) SD.Particles.trail(this.x + (Math.random() - 0.5) * 5, this.y + 13, '#ff9f43', 2.5, 90);

    this.fireTimer -= dt;
    if (firing && this.fireTimer <= 0) { this.fireTimer = P.FIRE_DELAY; this.shoot(world); }
  }

  shoot(world) {
    const add = (ox, vx) => world.pBullets.push(
      new SD.Bullet(this.x + ox, this.y - 14, vx, -640, { friendly: true, r: 4, color: '#77ffff', damage: 1 }));
    switch (this.weapon) {
      case 1: add(0, 0); break;
      case 2: add(-8, 0); add(8, 0); break;
      case 3: add(0, 0); add(-10, -90); add(10, 90); break;
      default: add(0, 0); add(-9, -70); add(9, 70); add(-14, -190); add(14, 190);
    }
    SD.Particles.burst(this.x, this.y - 16, '#aaffff', 1, 40, 3);   // clarão do cano
    SD.Audio.play('shoot');
  }

  /** Retorna true se o ataque foi "consumido" (acertou ou foi absorvido pelo escudo). */
  hurt() {
    if (this.dead || this.invuln > 0) return false;
    if (this.shield > 0) { SD.Audio.play('hit'); SD.FX.ring(this.x, this.y, '#59f3ff', 34, 0.25, 2); return true; }
    this.lives--;
    this.weapon = Math.max(1, this.weapon - 1);
    this.invuln = SD.CONFIG.PLAYER.INVULN;
    SD.Particles.burst(this.x, this.y, '#77ffff', 26, 240, 3);
    SD.Particles.burst(this.x, this.y, '#ffffff', 10, 140, 2);
    SD.FX.ring(this.x, this.y, '#ff5577', 80, 0.5, 4);
    SD.Audio.play('explode');
    SD.Game.addShake(10);
    SD.Game.flash = Math.max(SD.Game.flash, 0.3);
    if (this.lives <= 0) {
      this.dead = true;
      for (let i = 0; i < 5; i++) SD.FX.later(i * 0.12, () => {
        SD.Particles.burst(this.x + SD.Utils.rand(-18, 18), this.y + SD.Utils.rand(-18, 18), i % 2 ? '#ff9f43' : '#77ffff', 22, 260, 4);
        SD.FX.ring(this.x, this.y, '#ffd43b', 40 + i * 25, 0.55, 3);
      });
    }
    return true;
  }

  draw(ctx) {
    if (this.dead) return;
    if (this.invuln > 0 && !this.entering && Math.floor(this.time * 14) % 2 === 0) return;   // pisca ao ser atingido
    SD.Player.drawShip(ctx, this.x, this.y, this.tilt, this.time);
    if (this.shield > 0) {
      const fading = this.shield < 2;
      const a = fading ? 0.35 + 0.35 * Math.sin(this.time * 22) : 0.8;
      const R = this.r + 13 + Math.sin(this.time * 6) * 1.5;
      ctx.save();
      ctx.fillStyle = SD.Utils.rgba('#59f3ff', 0.08 * a);
      ctx.strokeStyle = SD.Utils.rgba('#59f3ff', a);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.setLineDash([8, 10]); ctx.lineDashOffset = -this.time * 40;
      ctx.beginPath(); ctx.arc(this.x, this.y, R + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
};

/** Desenha a nave em qualquer lugar (usado no jogo e no menu). */
SD.Player.drawShip = function (ctx, x, y, tilt, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * 0.2);
  // chama do propulsor (tremula)
  const f = 10 + Math.sin(time * 40) * 3 + Math.random() * 4;
  const g = ctx.createLinearGradient(0, 8, 0, 8 + f * 1.6);
  g.addColorStop(0, '#fff6c8'); g.addColorStop(0.4, '#ffb347'); g.addColorStop(1, 'rgba(255,90,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-5, 9); ctx.lineTo(5, 9); ctx.lineTo(0, 9 + f * 1.6); ctx.closePath(); ctx.fill();
  // asas
  ctx.shadowColor = '#59f3ff'; ctx.shadowBlur = 14;
  ctx.fillStyle = '#1e9fc0';
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(19, 15); ctx.lineTo(8, 11); ctx.lineTo(0, 14); ctx.lineTo(-8, 11); ctx.lineTo(-19, 15); ctx.closePath(); ctx.fill();
  // corpo
  ctx.fillStyle = '#e4fbff';
  ctx.beginPath(); ctx.moveTo(0, -19); ctx.lineTo(8, 10); ctx.lineTo(0, 6); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
  // cabine
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff4fd8';
  ctx.beginPath(); ctx.ellipse(0, -2, 2.6, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
