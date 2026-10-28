/* CHEFES. Cada fase descreve seu chefe em levels/levelN.js (vida, cor, fases de ataque).
   Os ataques ficam aqui em SD.BossPatterns: { delay, dur, fire(boss, world) }. */
SD.BossPatterns = {
  aimed:  { delay: 0.9,  dur: 3,   fire(b, w) { SD.Fire.fan(b, w, 3, 0.4, SD.Utils.angleTo(b, w.player), 270); } },
  spread: { delay: 1.3,  dur: 3,   fire(b, w) { SD.Fire.fan(b, w, 7, 1.5, Math.PI / 2, 210, { color: '#ffa94d' }); } },
  radial: { delay: 1.7,  dur: 3.4, fire(b, w) { SD.Fire.radial(b, w, 20, 150, Math.random() * 6.28, { color: '#ffd43b' }); } },
  spiral: { delay: 0.12, dur: 3.2, fire(b, w) { b.spin = (b.spin || 0) + 0.33; SD.Fire.radial(b, w, 3, 190, b.spin, { color: '#ff8cf0' }); } },
  rain:   { delay: 0.3,  dur: 3.2, fire(b, w) { w.eBullets.push(new SD.Bullet(SD.Utils.rand(20, SD.CONFIG.WIDTH - 20), -10, 0, 230 * SD.Fire.mul, { color: '#74c0fc', r: 5 })); } },
  twin:   { delay: 0.5,  dur: 3,   fire(b, w) { for (const s of [-1, 1]) SD.Fire.angle({ x: b.x + s * 34, y: b.y + 10 }, w, Math.PI / 2, 300, { color: '#ff6b6b' }); } }
};

SD.Boss = class {
  constructor(cfg) {
    Object.assign(this, {
      cfg, x: SD.CONFIG.WIDTH / 2, y: -90, r: cfg.r || 44,
      hp: cfg.hp, maxHp: cfg.hp, entering: true, t: 0, flash: 0, pulse: 0,
      phase: 0, patIndex: 0, patTime: 1.5, rest: 1, fireTimer: 0, dead: false
    });
  }

  get vulnerable() { return !this.entering; }

  update(dt, w) {
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.pulse > 0) this.pulse = Math.max(0, this.pulse - dt * 2);

    if (this.entering) {                                   // descida dramática
      this.y += 85 * dt;
      if (this.y >= 130) {
        this.y = 130; this.entering = false; this.pulse = 1;
        SD.Audio.play('boss'); SD.Game.addShake(8);
        SD.FX.ring(this.x, this.y, this.cfg.color, 160, 0.8, 5);
      }
      return;
    }

    const n = this.cfg.phases.length;
    const ph = Math.min(n - 1, Math.floor((1 - this.hp / this.maxHp) * n));
    if (ph !== this.phase) {                               // mudança de fase: onda de choque + limpa tiros
      this.phase = ph; this.patIndex = 0; this.rest = 1.1; this.fireTimer = 0; this.pulse = 1;
      w.eBullets.forEach(b => { b.dead = true; SD.Particles.burst(b.x, b.y, this.cfg.color, 2, 60, 2); });
      SD.FX.ring(this.x, this.y, this.cfg.color, 260, 0.7, 6);
      SD.FX.text(this.x, this.y + 70, 'FASE ' + (ph + 1), '#ffffff', 16);
      SD.Game.addShake(10); SD.Audio.play('boss');
    }

    this.x = SD.CONFIG.WIDTH / 2 + Math.sin(this.t * (0.7 + 0.25 * this.phase)) * (SD.CONFIG.WIDTH / 2 - this.r - 24);
    this.y = 130 + Math.sin(this.t * 1.3) * 18;

    if (this.rest > 0) { this.rest -= dt; return; }
    const list = this.cfg.phases[this.phase];
    const pat = SD.BossPatterns[list[this.patIndex % list.length]];
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) { pat.fire(this, w); this.fireTimer = pat.delay * (this.cfg.delayMul || 1); }
    this.patTime -= dt;
    if (this.patTime <= 0) { this.patIndex++; this.patTime = pat.dur || 3; this.rest = 0.8; this.fireTimer = 0; }
  }

  damage(n) {
    if (!this.vulnerable) return false;
    this.hp -= n; this.flash = 0.06;
    return this.hp <= 0;
  }

  draw(ctx) {
    const r = this.r, c = this.cfg.color;
    const charge = (!this.entering && this.rest <= 0 && this.fireTimer < 0.18) ? 1 : 0;
    const s = 1 + 0.12 * this.pulse + 0.03 * charge;
    const flap = Math.sin(this.t * 3) * r * 0.08;           // asas respiram
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    ctx.shadowColor = c; ctx.shadowBlur = 24 + charge * 18;
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : c;
    ctx.beginPath();
    ctx.moveTo(-r * 1.5, -r * 0.3 + flap); ctx.lineTo(-r * 0.5, -r * 0.9); ctx.lineTo(r * 0.5, -r * 0.9);
    ctx.lineTo(r * 1.5, -r * 0.3 + flap); ctx.lineTo(r * 0.9, r * 0.5); ctx.lineTo(0, r); ctx.lineTo(-r * 0.9, r * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;               // anéis internos girando
    ctx.setLineDash([10, 8]); ctx.lineDashOffset = -this.t * 40;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.stroke();
    ctx.lineDashOffset = this.t * 55;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(this.t * 6) + charge * 0.4;           // núcleo pulsa
    ctx.fillStyle = this.cfg.core || '#ffffff';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (this.entering) {                                    // escudo piscando enquanto é invulnerável
      ctx.save();
      ctx.strokeStyle = SD.Utils.rgba('#ffffff', 0.3 + 0.3 * Math.sin(this.t * 14));
      ctx.lineWidth = 3; ctx.setLineDash([12, 8]); ctx.lineDashOffset = -this.t * 60;
      ctx.beginPath(); ctx.arc(this.x, this.y, r * 1.7, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
};
