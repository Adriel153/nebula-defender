/* EFEITOS VISUAIS: anéis de choque, textos flutuantes e eventos agendados.
   Use SD.FX.ring(...), SD.FX.text(...) e SD.FX.later(segundos, funcao). */
SD.FX = {
  rings: [], texts: [], timers: [],

  ring(x, y, color, maxR = 60, dur = 0.5, width = 3, delay = 0) {
    this.rings.push({ x, y, color, maxR, dur, width, t: -delay });
  },

  text(x, y, str, color = '#ffffff', size = 14) {
    this.texts.push({ x: SD.Utils.clamp(x, 50, SD.CONFIG.WIDTH - 50), y, str, color, size, t: 0, dur: 1 });
  },

  /** Executa fn depois de `delay` segundos (respeita slow-motion e pausa). */
  later(delay, fn) { this.timers.push({ t: delay, fn }); },

  clear() { this.rings = []; this.texts = []; this.timers = []; },

  update(dt) {
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter(r => r.t < r.dur);

    for (const t of this.texts) { t.t += dt; t.y -= 34 * dt; }
    this.texts = this.texts.filter(t => t.t < t.dur);

    for (const tm of this.timers) tm.t -= dt;
    const due = this.timers.filter(tm => tm.t <= 0);
    this.timers = this.timers.filter(tm => tm.t > 0);
    due.forEach(tm => tm.fn());
  },

  draw(ctx) {
    const U = SD.Utils;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const r of this.rings) {
      if (r.t < 0) continue;
      const p = r.t / r.dur;
      ctx.strokeStyle = U.rgba(r.color, 1 - p);
      ctx.lineWidth = Math.max(0.5, r.width * (1 - p));
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.maxR * U.easeOutCubic(p), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.texts) {
      const p = t.t / t.dur;
      const pop = 1 + 0.6 * Math.max(0, 1 - t.t * 7);    // "estouro" no início
      ctx.globalAlpha = 1 - p * p;
      ctx.font = `700 ${Math.round(t.size * pop)}px Orbitron, "Segoe UI", sans-serif`;
      ctx.fillStyle = t.color;
      ctx.shadowColor = t.color; ctx.shadowBlur = 8;
      ctx.fillText(t.str, t.x, t.y);
    }
    ctx.restore();
  }
};
