/* TELAS: menu, introdução de fase, pausa, fase concluída, fim de jogo e vitória.
   Todas são desenhadas no canvas, com animações guiadas por g.timer (tempo no estado atual). */
SD.Screens = (() => {
  const W = SD.CONFIG.WIDTH, H = SD.CONFIG.HEIGHT, U = SD.Utils;
  const font = (w, s) => `${w} ${s}px Orbitron, "Segoe UI", system-ui, sans-serif`;

  function text(ctx, str, x, y, size, color, o = {}) {
    ctx.save();
    ctx.font = font(o.weight || 700, size);
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 18; }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  /** Texto cujas letras ondulam. */
  function waveText(ctx, str, cx, y, size, color, glow, time, amp) {
    ctx.save();
    ctx.font = font(800, size); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = color; ctx.shadowColor = glow; ctx.shadowBlur = 16 + 8 * Math.sin(time * 3);
    const ws = [...str].map(ch => ctx.measureText(ch).width);
    let x = cx - ws.reduce((a, b) => a + b, 0) / 2;
    [...str].forEach((ch, i) => { ctx.fillText(ch, x, y + Math.sin(time * 3 + i * 0.6) * amp); x += ws[i]; });
    ctx.restore();
  }

  const dim = (ctx, a) => { ctx.fillStyle = `rgba(2,4,14,${a})`; ctx.fillRect(0, 0, W, H); };
  const blink = (g, rate = 1.1) => 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(g.clock * rate * Math.PI * 2));
  const clamp01 = v => U.clamp(v, 0, 1);

  /** Faixa que entra por um lado e sai pelo outro (dir -1: esquerda->direita, +1: direita->esquerda). */
  function slideX(t, T, dir) {
    const d = 0.45;
    if (t < d) return U.lerp(W / 2 + dir * W, W / 2, U.easeOutCubic(t / d));
    if (t > T - d) return U.lerp(W / 2, W / 2 - dir * W, U.easeInCubic(clamp01((t - (T - d)) / d)));
    return W / 2;
  }

  return {
    INTRO_TIME: 2.6,

    /** Posição da nave decorativa do menu. */
    menuShip(g) {
      return { x: W / 2 + Math.sin(g.clock * 0.9) * 110, y: H - 100 + Math.sin(g.clock * 1.7) * 8, tilt: Math.cos(g.clock * 0.9) * 0.8 };
    },

    menu(ctx, g) {
      const t = g.timer;
      dim(ctx, 0.3);
      const drop = U.easeOutBounce(clamp01(t / 1.0));
      waveText(ctx, 'NEBULA', W / 2, U.lerp(-60, 190, drop), 66, '#59f3ff', '#59f3ff', g.clock, 4);
      const sx = U.lerp(W + 320, W / 2, U.easeOutCubic(clamp01((t - 0.5) / 0.8)));
      text(ctx, 'DEFENDER', sx, 256, 44, '#ff4fd8', { weight: 800, glow: '#ff4fd8' });
      text(ctx, 'RECORDE ' + U.pad(g.hi, 7), W / 2, 318, 13, '#7fe8c0', { alpha: clamp01((t - 1) / 0.5) });
      text(ctx, 'ENTER, ESPAÇO OU TOQUE PARA JOGAR', W / 2, 372, 14, '#ffffff', { alpha: clamp01((t - 1.2) / 0.5) * blink(g) });

      const lines = ['SETAS ou WASD  —  mover', 'ESPAÇO ou Z  —  atirar', 'B ou X  —  bomba', 'P ou ESC  —  pausar    M  —  som', 'Toque: arraste para mover (tiro automático)'];
      lines.forEach((l, i) => {
        const a = clamp01((t - 1.5 - i * 0.18) / 0.4);
        text(ctx, l, W / 2 + (1 - a) * 30, 440 + i * 26, 12, '#b9d4ee', { alpha: a });
      });
      const s = this.menuShip(g);
      SD.Player.drawShip(ctx, s.x, s.y, s.tilt, g.clock);
    },

    intro(ctx, g) {
      const lv = SD.Levels[g.levelIndex], t = g.timer, T = this.INTRO_TIME;
      const a = Math.min(clamp01(t / 0.45), clamp01((T - t) / 0.45));
      const h = 150 * U.easeOutCubic(a);
      ctx.fillStyle = `rgba(3,6,20,${0.72 * a})`;
      ctx.fillRect(0, H / 2 - h / 2, W, h);
      ctx.fillStyle = U.rgba(lv.colors.star, a);                                      // filetes que se abrem
      ctx.fillRect(W / 2 - W * a / 2, H / 2 - h / 2, W * a, 2);
      ctx.fillRect(W / 2 - W * a / 2, H / 2 + h / 2 - 2, W * a, 2);
      text(ctx, 'FASE ' + (g.levelIndex + 1), slideX(t, T, -1), H / 2 - 30, 38, '#ffffff', { weight: 800, glow: lv.colors.nebula });
      text(ctx, lv.name.toUpperCase(), slideX(t, T, 1), H / 2 + 12, 20, lv.colors.star, { glow: lv.colors.nebula });
      text(ctx, lv.subtitle, W / 2, H / 2 + 44, 12, '#cfe8ff', { alpha: clamp01((t - 0.6) / 0.4) * a });
    },

    paused(ctx, g) {
      const a = clamp01(g.timer * 4);
      dim(ctx, 0.55 * a);
      ctx.save(); ctx.translate(W / 2, H / 2 - 20); const s = 1 + 0.03 * Math.sin(g.clock * 4); ctx.scale(s, s);
      text(ctx, 'PAUSADO', 0, 0, 44, '#ffffff', { weight: 800, glow: '#59f3ff', alpha: a });
      ctx.restore();
      text(ctx, 'P, ESC OU TOQUE PARA CONTINUAR', W / 2, H / 2 + 36, 12, '#cfe8ff', { alpha: a * blink(g) });
    },

    levelClear(ctx, g) {
      const t = g.timer, lv = SD.Levels[g.levelIndex];
      dim(ctx, 0.4 * clamp01(t * 2));
      ctx.save(); ctx.translate(W / 2, 250);
      const s = U.easeOutBack(clamp01(t / 0.6)); ctx.scale(s, s);
      text(ctx, 'FASE CONCLUÍDA', 0, 0, 34, '#7fffd4', { weight: 800, glow: '#20e3b2' });
      ctx.restore();
      text(ctx, lv.name.toUpperCase(), W / 2, 296, 14, '#cfe8ff', { alpha: clamp01((t - 0.5) / 0.4) });
      const k = clamp01((t - 0.8) / 1.2);
      text(ctx, 'BÔNUS  +' + Math.floor(g.bonus * k), W / 2, 350, 20, '#ffd43b', { alpha: clamp01((t - 0.7) / 0.3), glow: '#ffd43b', blur: 10 });
      text(ctx, 'ENTER OU TOQUE PARA CONTINUAR', W / 2, 410, 12, '#ffffff', { alpha: clamp01((t - 1.5) / 0.4) * blink(g) });
    },

    gameOver(ctx, g) {
      const t = g.timer;
      dim(ctx, Math.min(0.75, t * 0.6));
      const y = U.lerp(-80, 240, U.easeOutBounce(clamp01((t - 0.3) / 1.2)));
      text(ctx, 'FIM DE JOGO', W / 2, y, 44, '#ff5577', { weight: 800, glow: '#ff2d55' });
      const k = clamp01((t - 1.2) / 1.2);
      text(ctx, 'PONTUAÇÃO  ' + U.pad(g.score * k, 7), W / 2, 310, 18, '#ffffff', { alpha: clamp01((t - 1.1) / 0.3) });
      if (g.newRecord && t > 2.4) {
        const s = 1 + 0.08 * Math.sin(g.clock * 8);
        ctx.save(); ctx.translate(W / 2, 352); ctx.scale(s, s);
        text(ctx, 'NOVO RECORDE!', 0, 0, 18, '#ffd43b', { glow: '#ffd43b' });
        ctx.restore();
      }
      text(ctx, 'ENTER OU TOQUE PARA VOLTAR AO MENU', W / 2, 410, 12, '#ffffff', { alpha: clamp01((t - 2.2) / 0.4) * blink(g) });
    },

    victory(ctx, g) {
      const t = g.timer;
      dim(ctx, 0.3 * clamp01(t));
      const s = U.easeOutBack(clamp01(t / 0.9)) * (1 + 0.03 * Math.sin(g.clock * 5));
      ctx.save(); ctx.translate(W / 2, 220); ctx.scale(s, s);
      const col = `hsl(${(g.clock * 120) % 360},100%,68%)`;
      text(ctx, 'VITÓRIA!', 0, 0, 54, col, { weight: 800, glow: col });
      ctx.restore();
      text(ctx, 'VOCÊ SALVOU A GALÁXIA', W / 2, 280, 16, '#ffffff', { alpha: clamp01((t - 0.8) / 0.5) });
      text(ctx, 'PONTUAÇÃO  ' + U.pad(g.score * clamp01((t - 1) / 1.5), 7), W / 2, 330, 18, '#ffd43b', { alpha: clamp01((t - 1) / 0.4) });
      if (g.newRecord && t > 2.5) text(ctx, 'NOVO RECORDE!', W / 2, 366, 16, '#7fffd4', { glow: '#20e3b2', alpha: blink(g, 2) });
      text(ctx, 'ENTER OU TOQUE PARA VOLTAR AO MENU', W / 2, 430, 12, '#ffffff', { alpha: clamp01((t - 3) / 0.4) * blink(g) });
    },

    bossWarning(ctx, g) {
      const t = 2.4 - g.bossWarn;
      const a = Math.min(1, t / 0.3, g.bossWarn / 0.4);
      const y0 = H * 0.34, h = 100 * U.easeOutCubic(a);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, y0 + 50 - h / 2, W, h); ctx.clip();
      ctx.fillStyle = 'rgba(60,0,10,.8)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,60,60,.32)';
      const off = (g.clock * 140) % 60;
      for (let x = -120 + off; x < W + 120; x += 60) {                              // faixa de perigo rolando
        ctx.beginPath(); ctx.moveTo(x, y0 + 100); ctx.lineTo(x + 30, y0 + 100); ctx.lineTo(x + 60, y0); ctx.lineTo(x + 30, y0); ctx.fill();
      }
      ctx.restore();
      const boss = SD.Levels[g.levelIndex].boss;
      const pulse = 1 + 0.06 * Math.sin(g.clock * 14);
      ctx.save(); ctx.translate(W / 2, y0 + 38); ctx.scale(pulse, pulse);
      text(ctx, 'ALERTA', 0, 0, 38, '#ffffff', { weight: 800, glow: '#ff2d55', alpha: a * (0.6 + 0.4 * Math.sin(g.clock * 16)) });
      ctx.restore();
      text(ctx, 'CHEFE: ' + boss.name, W / 2, y0 + 76, 14, '#ffd6dd', { alpha: a });
    }
  };
})();
