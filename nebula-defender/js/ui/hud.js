/* HUD (placar, vidas, bombas, arma, barra do chefe) com animações:
   contagem progressiva do placar, "pulo" ao pontuar, tremida ao perder vida,
   barra do chefe com rastro de dano. */
SD.HUD = {
  dispScore: 0, prevScore: 0, scorePop: 0,
  prevLives: 3, lifeShake: 0, pipPulse: 0,
  bar: 0, ghost: 0, barAlpha: 0, bossName: '',

  reset(g) {
    this.dispScore = this.prevScore = g.score;
    this.prevLives = g.world.player.lives;
    this.scorePop = this.lifeShake = this.pipPulse = 0;
    this.bar = this.ghost = this.barAlpha = 0;
  },

  pulse(what) { if (what === 'weapon') this.pipPulse = 0.6; },

  update(dt, g) {
    const p = g.world.player, b = g.world.boss;
    this.dispScore += (g.score - this.dispScore) * Math.min(1, dt * 8);
    if (Math.abs(g.score - this.dispScore) < 1) this.dispScore = g.score;
    if (g.score > this.prevScore) this.scorePop = 0.2;
    this.prevScore = g.score;
    if (p.lives < this.prevLives) this.lifeShake = 0.5;
    this.prevLives = p.lives;
    if (this.scorePop > 0) this.scorePop -= dt;
    if (this.lifeShake > 0) this.lifeShake -= dt;
    if (this.pipPulse > 0) this.pipPulse -= dt;

    if (b) {
      this.bossName = b.cfg.name;
      this.barAlpha = Math.min(1, this.barAlpha + dt * 3);
      const target = b.entering ? Math.min(1, Math.max(0, (b.y + 90) / 220)) : b.hp / b.maxHp;   // enche durante a entrada
      this.bar += (target - this.bar) * Math.min(1, dt * 10);
      this.ghost = this.ghost > this.bar ? this.ghost + (this.bar - this.ghost) * Math.min(1, dt * 1.6) : this.bar;
    } else {
      this.barAlpha = Math.max(0, this.barAlpha - dt * 2);
      if (this.barAlpha === 0) this.bar = this.ghost = 0;
    }
  },

  mini(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 8, y + 7); ctx.lineTo(x, y + 3); ctx.lineTo(x - 8, y + 7); ctx.closePath(); ctx.fill();
  },

  draw(ctx, g) {
    const W = SD.CONFIG.WIDTH, H = SD.CONFIG.HEIGHT, P = SD.CONFIG.PLAYER, U = SD.Utils;
    const p = g.world.player;
    const font = s => `700 ${s}px Orbitron, "Segoe UI", sans-serif`;
    ctx.save();
    ctx.globalAlpha = g.state === 'intro' ? Math.min(1, g.timer / 0.8) : 1;
    ctx.textBaseline = 'middle';

    // placar (pulsa ao pontuar)
    ctx.save();
    ctx.translate(14, 18);
    const sc = 1 + this.scorePop * 1.4;
    ctx.scale(sc, sc);
    ctx.font = font(14); ctx.textAlign = 'left'; ctx.fillStyle = this.scorePop > 0 ? '#ffffff' : '#e8fbff';
    ctx.fillText('PONTOS ' + U.pad(this.dispScore, 7), 0, 0);
    ctx.restore();
    ctx.font = font(10); ctx.textAlign = 'left'; ctx.fillStyle = '#7fe8c0';
    ctx.fillText('RECORDE ' + U.pad(g.hi, 7), 14, 36);

    ctx.textAlign = 'right'; ctx.font = font(12); ctx.fillStyle = '#59f3ff';
    ctx.fillText('FASE ' + (g.levelIndex + 1) + '/' + SD.Levels.length, W - 14, 18);
    if (SD.Input.touch.used) {                                    // botão de pausa (toque)
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillRect(W - 24, 32, 4, 14); ctx.fillRect(W - 16, 32, 4, 14);
    }

    // vidas (tremem ao perder uma)
    const shk = this.lifeShake > 0 ? Math.sin(this.lifeShake * 70) * 4 : 0;
    for (let i = 0; i < p.lives; i++) this.mini(ctx, 22 + i * 24 + shk, H - 22, this.lifeShake > 0 ? '#ff5577' : '#59f3ff');

    // bombas
    ctx.textAlign = 'left'; ctx.font = font(11); ctx.fillStyle = '#ffd43b';
    ctx.fillText('BOMBAS x' + p.bombs, 14, H - 46);

    // arma
    const pw = this.pipPulse > 0 ? 1 + this.pipPulse * 0.8 : 1;
    for (let i = 0; i < P.MAX_WEAPON; i++) {
      const on = i < p.weapon, x = W / 2 - 34 + i * 18;
      ctx.fillStyle = on ? '#ff9f43' : 'rgba(255,255,255,.18)';
      const h = on && i === p.weapon - 1 ? 10 * pw : 10;
      ctx.fillRect(x, H - 24 - (h - 10) / 2, 12, h);
    }
    ctx.textAlign = 'center'; ctx.font = font(9); ctx.fillStyle = '#ffcf9c';
    ctx.fillText('ARMA', W / 2, H - 38);

    // escudo
    if (p.shield > 0) {
      ctx.fillStyle = 'rgba(89,243,255,.2)'; ctx.fillRect(W / 2 - 40, H - 12, 80, 4);
      ctx.fillStyle = '#59f3ff'; ctx.fillRect(W / 2 - 40, H - 12, 80 * U.clamp(p.shield / P.SHIELD_TIME, 0, 1), 4);
    }

    // barra do chefe
    if (this.barAlpha > 0) {
      ctx.globalAlpha = this.barAlpha;
      const x = 40, y = 56, w = W - 80, h = 10;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, w * this.ghost, h);          // rastro de dano
      ctx.fillStyle = '#ff4d6d'; ctx.fillRect(x, y, w * this.bar, h);
      ctx.textAlign = 'center'; ctx.font = font(10); ctx.fillStyle = '#ffd6dd';
      ctx.fillText(this.bossName, W / 2, y - 9);
    }

    // botão de bomba (toque)
    if (SD.Input.touch.used) {
      ctx.globalAlpha = 0.8;
      const pulse = 1 + 0.05 * Math.sin(g.clock * 5);
      ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W - 40, H - 40, 26 * pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffd43b'; ctx.font = font(16); ctx.textAlign = 'center'; ctx.fillText('B', W - 40, H - 39);
    }
    ctx.restore();
  }
};
