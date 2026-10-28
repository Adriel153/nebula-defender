/* PARTÍCULAS: faíscas, explosões e rastros de propulsor. */
SD.Particles = {
  list: [],
  MAX: 700,

  burst(x, y, color, n = 14, speed = 160, size = 3) {
    for (let i = 0; i < n && this.list.length < this.MAX; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      const life = 0.35 + Math.random() * 0.5;
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, color, size: size * (0.6 + Math.random() * 0.8) });
    }
  },

  /** Uma partícula curta, usada em rastros (propulsores, mísseis). */
  trail(x, y, color, size = 3, vy = 60) {
    if (this.list.length >= this.MAX) return;
    const life = 0.25 + Math.random() * 0.2;
    this.list.push({ x: x + (Math.random() - 0.5) * 3, y, vx: (Math.random() - 0.5) * 20, vy, life, max: life, color, size });
  },

  update(dt) {
    const l = this.list;
    let j = 0;
    for (let i = 0; i < l.length; i++) {
      const p = l[i];
      p.life -= dt;
      if (p.life <= 0) continue;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.985; p.vy *= 0.985;
      l[j++] = p;
    }
    l.length = j;
  },

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.list) {
      const k = p.life / p.max;
      const s = p.size * (0.4 + k * 0.6);
      ctx.globalAlpha = k;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.restore();
  },

  clear() { this.list.length = 0; }
};
