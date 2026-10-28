/* FUNDO ANIMADO: gradiente da fase, nebulosas flutuando, estrelas em 3 camadas,
   estrelas cadentes e efeito "warp" (hiperespaço) no início de cada fase. */
SD.Background = {
  stars: [], blobs: [], streaks: [], warp: 1, streakTimer: 2,
  colors: { bgTop: '#050816', bgBottom: '#0a1a3a', star: '#9fd8ff', nebula: '#2b4cff' },

  init() {
    const { WIDTH: W, HEIGHT: H } = SD.CONFIG, R = SD.Utils.rand;
    this.stars = [];
    for (let i = 0; i < 110; i++) {
      const z = i % 3;
      this.stars.push({ x: R(0, W), y: R(0, H), s: [1, 1.5, 2.2][z], v: [25, 60, 120][z], tw: R(0, 6) });
    }
  },

  setLevel(lv) {
    const { WIDTH: W, HEIGHT: H } = SD.CONFIG, R = SD.Utils.rand;
    this.colors = Object.assign({}, this.colors, lv.colors);
    this.blobs = [];
    for (let i = 0; i < 5; i++) this.blobs.push({ x: R(0, W), y: R(0, H), r: R(130, 230), v: R(8, 20), ph: R(0, 6) });
  },

  update(dt) {
    const { WIDTH: W, HEIGHT: H } = SD.CONFIG, R = SD.Utils.rand;
    if (this.warp > 1) this.warp = Math.max(1, this.warp - dt * 3.2);      // warp desacelera até o normal
    for (const s of this.stars) {
      s.y += s.v * this.warp * dt;
      if (s.y > H + 20) { s.y = -10; s.x = R(0, W); }
    }
    for (const b of this.blobs) {
      b.y += b.v * dt; b.ph += dt;
      if (b.y - b.r > H) { b.y = -b.r; b.x = R(0, W); }
    }
    this.streakTimer -= dt;
    if (this.streakTimer <= 0) {                                              // estrela cadente
      this.streakTimer = R(2, 5);
      this.streaks.push({ x: R(60, W), y: R(-20, 200), vx: -R(250, 400), vy: R(300, 450), life: 0.7 });
    }
    for (const s of this.streaks) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; }
    this.streaks = this.streaks.filter(s => s.life > 0);
  },

  draw(ctx) {
    const { WIDTH: W, HEIGHT: H } = SD.CONFIG, U = SD.Utils, c = this.colors;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c.bgTop); g.addColorStop(1, c.bgBottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    for (const b of this.blobs) {                                              // nebulosas "respirando"
      const r = b.r * (1 + 0.06 * Math.sin(b.ph * 0.8));
      const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      rg.addColorStop(0, U.rgba(c.nebula, 0.22)); rg.addColorStop(1, U.rgba(c.nebula, 0));
      ctx.fillStyle = rg; ctx.fillRect(b.x - r, b.y - r, r * 2, r * 2);
    }

    ctx.fillStyle = c.star;
    for (const s of this.stars) {
      s.tw += 0.05;
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(s.tw * 2);                      // cintilar
      ctx.fillRect(s.x, s.y, s.s, s.s + (this.warp - 1) * s.v * 0.05);        // vira risco no warp
    }
    ctx.globalAlpha = 1;

    ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const s of this.streaks) {
      ctx.strokeStyle = U.rgba('#ffffff', Math.max(0, s.life));
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 0.08, s.y - s.vy * 0.08); ctx.stroke();
    }
  }
};
