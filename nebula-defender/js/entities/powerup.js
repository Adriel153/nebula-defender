/* ITENS COLETÁVEIS. Para criar um novo, adicione em SD.PowerTypes e trate em apply(). */
SD.PowerTypes = {
  weapon: { color: '#ff9f43', label: 'P', text: 'ARMA +' },
  shield: { color: '#59f3ff', label: 'S', text: 'ESCUDO' },
  bomb:   { color: '#ffd43b', label: 'B', text: '+1 BOMBA' },
  life:   { color: '#ff4fd8', label: '+', text: '+1 VIDA' }
};

SD.PowerUp = class {
  constructor(kind, x, y) {
    Object.assign(this, { kind, def: SD.PowerTypes[kind], x, y, x0: x, r: 13, t: 0, dead: false });
  }

  update(dt, w) {
    this.t += dt;
    this.y += 85 * dt;
    const p = w.player;
    const d = Math.hypot(p.x - this.x, p.y - this.y);
    if (!p.dead && d < 110) {                         // ímã: é atraído quando o jogador chega perto
      const k = (1 - d / 110) * 420 * dt;
      this.x += (p.x - this.x) / d * k; this.y += (p.y - this.y) / d * k;
      this.x0 = this.x;
    } else {
      this.x = this.x0 + Math.sin(this.t * 2.2) * 18;
    }
    if (this.y > SD.CONFIG.HEIGHT + 30) this.dead = true;
  }

  apply(p) {
    const C = SD.CONFIG.PLAYER, G = SD.Game;
    switch (this.kind) {
      case 'weapon': if (p.weapon < C.MAX_WEAPON) { p.weapon++; G.hudPulse('weapon'); } else G.addScore(500); break;
      case 'shield': p.shield = C.SHIELD_TIME; break;
      case 'bomb':   p.bombs = Math.min(C.MAX_BOMBS, p.bombs + 1); break;
      case 'life':   p.lives = Math.min(C.MAX_LIVES, p.lives + 1); break;
    }
    SD.FX.text(this.x, this.y - 12, this.def.text, this.def.color, 13);
    SD.FX.ring(this.x, this.y, this.def.color, 52, 0.45, 3);
    SD.Particles.burst(this.x, this.y, this.def.color, 14, 150, 3);
    SD.Audio.play('power');
  }

  draw(ctx) {
    const c = this.def.color, pulse = 1 + 0.12 * Math.sin(this.t * 7);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(pulse, pulse);
    ctx.shadowColor = c; ctx.shadowBlur = 16;
    ctx.fillStyle = SD.Utils.rgba(c, 0.25);
    ctx.beginPath(); ctx.arc(0, 0, this.r + 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c; ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]); ctx.lineDashOffset = -this.t * 30;      // anel girando
    ctx.beginPath(); ctx.arc(0, 0, this.r + 4, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, 0, this.r - 2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#10131f';
    ctx.font = '800 14px Orbitron, "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.scale(Math.cos(this.t * 3), 1);                              // letra "gira" como moeda
    ctx.fillText(this.def.label, 0, 1);
    ctx.restore();
  }
};
