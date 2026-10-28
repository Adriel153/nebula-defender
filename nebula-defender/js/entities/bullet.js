/* TIROS + padrões de disparo (SD.Fire), usados por inimigos e chefes. */
SD.Bullet = class {
  constructor(x, y, vx, vy, o = {}) {
    Object.assign(this, { x, y, vx, vy, r: 4, damage: 1, color: '#ffffff', friendly: false, dead: false, age: 0 }, o);
  }

  update(dt) {
    this.age += dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const m = 40, W = SD.CONFIG.WIDTH, H = SD.CONFIG.HEIGHT;
    if (this.x < -m || this.x > W + m || this.y < -m || this.y > H + m) this.dead = true;
  }

  draw(ctx) {
    const U = SD.Utils;
    if (this.friendly) {
      // tiro do jogador: raio com rastro
      ctx.fillStyle = U.rgba(this.color, 0.25);
      ctx.fillRect(this.x - 2, this.y, 4, -this.vy * 0.035);
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - 2, this.y - 8, 4, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 1, this.y - 6, 2, 12);
    } else {
      // tiro inimigo: orbe pulsante
      const pulse = 1.9 + 0.3 * Math.sin(this.age * 14);
      ctx.fillStyle = U.rgba(this.color, 0.32);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 0.45, 0, Math.PI * 2); ctx.fill();
    }
  }
};

/** Padrões de disparo reutilizáveis. `mul` aumenta a velocidade dos tiros a cada fase. */
SD.Fire = {
  mul: 1,
  angle(src, world, a, speed, o = {}) {
    const s = speed * this.mul;
    world.eBullets.push(new SD.Bullet(src.x, src.y, Math.cos(a) * s, Math.sin(a) * s, Object.assign({ color: '#ff5577', r: 5 }, o)));
  },
  aimed(src, world, speed, o) { this.angle(src, world, SD.Utils.angleTo(src, world.player), speed, o); },
  fan(src, world, n, arc, center, speed, o) {
    for (let i = 0; i < n; i++) {
      const a = center + (n === 1 ? 0 : (i / (n - 1) - 0.5) * arc);
      this.angle(src, world, a, speed, o);
    }
  },
  radial(src, world, n, speed, offset = 0, o) {
    for (let i = 0; i < n; i++) this.angle(src, world, offset + i * Math.PI * 2 / n, speed, o);
  }
};
