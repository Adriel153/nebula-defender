/* INIMIGOS. Para criar um tipo novo, adicione uma entrada em SD.EnemyTypes:
   { hp, r, score, color, drop, init(e), update(e, dt, world), draw(ctx, e) } */
(function () {
  const W = SD.CONFIG.WIDTH, U = SD.Utils;

  function poly(ctx, n, r, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + i * Math.PI * 2 / n;
      i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  }

  SD.EnemyTypes = {
    /* Drone: desce em linha reta, batendo as asas. */
    drone: {
      hp: 1, r: 14, score: 100, color: '#ff6b6b', drop: 0.06,
      update(e, dt) { e.y += 125 * dt; },
      draw(ctx, e) {
        const fl = Math.sin(e.t * 14) * 3;
        ctx.beginPath();
        ctx.moveTo(0, 14); ctx.lineTo(13 + fl, -12); ctx.lineTo(0, -5); ctx.lineTo(-13 - fl, -12);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2b0000'; ctx.fillRect(-2, -6, 4, 8);
      }
    },

    /* Zigzag: ondula pela tela e atira para baixo. */
    zigzag: {
      hp: 2, r: 15, score: 150, color: '#ffa94d', drop: 0.1,
      init(e) { e.x0 = e.x; e.phase = Math.random() * 6; },
      update(e, dt, w) {
        e.y += 95 * dt;
        e.x = U.clamp(e.x0 + Math.sin(e.t * 2.6 + e.phase) * 70, 20, W - 20);
        e.fire -= dt;
        if (e.fire <= 0 && e.y > 0) { e.fire = 2.2; SD.Fire.angle(e, w, Math.PI / 2, 230, { color: '#ffa94d' }); }
      },
      draw(ctx, e) {
        ctx.rotate(e.t * 2);
        poly(ctx, 4, e.r); ctx.fill();
        ctx.fillStyle = '#2b1500'; poly(ctx, 4, e.r * 0.45); ctx.fill();
      }
    },

    /* Atirador: para no alto, desliza de um lado a outro e mira no jogador. */
    shooter: {
      hp: 4, r: 17, score: 250, color: '#da77f2', drop: 0.18,
      init(e) { e.targetY = U.rand(90, 200); e.vx = Math.random() < 0.5 ? -45 : 45; e.stay = 6.5; },
      update(e, dt, w) {
        if (e.y < e.targetY) e.y += 140 * dt;
        else {
          e.x += e.vx * dt;
          if (e.x < 40 || e.x > W - 40) e.vx *= -1;
          e.stay -= dt;
          if (e.stay <= 0) e.y += 170 * dt;       // vai embora
        }
        e.fire -= dt;
        if (e.fire <= 0 && e.y > 10 && e.stay > 0) { e.fire = 1.6; SD.Fire.aimed(e, w, 235, { color: '#e599f7' }); }
      },
      draw(ctx, e) {
        ctx.beginPath(); ctx.arc(0, 0, e.r, 0, Math.PI * 2); ctx.fill();
        ctx.save();
        ctx.strokeStyle = '#f3d9fa'; ctx.lineWidth = 2; ctx.setLineDash([7, 7]); ctx.lineDashOffset = -e.t * 30;
        ctx.beginPath(); ctx.arc(0, 0, e.r + 5, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#1b0b26'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(Math.cos(e.look) * 2.5, Math.sin(e.look) * 2.5, 5, 0, Math.PI * 2); ctx.fill();   // olho segue o jogador
        ctx.fillStyle = '#ff2d55'; ctx.beginPath(); ctx.arc(Math.cos(e.look) * 4.5, Math.sin(e.look) * 4.5, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    },

    /* Kamikaze: espera, mira e se lança contra o jogador (curva limitada, dá para desviar). */
    kamikaze: {
      hp: 2, r: 13, score: 200, color: '#ff4fd8', drop: 0.1,
      init(e) { e.angle = Math.PI / 2; e.wait = 0.8; },
      update(e, dt, w) {
        e.wait -= dt;
        if (e.wait > 0) { e.y += 50 * dt; return; }
        let diff = U.angleTo(e, w.player) - e.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        e.angle += U.clamp(diff, -2.2 * dt, 2.2 * dt);
        e.x += Math.cos(e.angle) * 235 * dt;
        e.y += Math.sin(e.angle) * 235 * dt;
        SD.Particles.trail(e.x - Math.cos(e.angle) * 10, e.y - Math.sin(e.angle) * 10, '#ff4fd8', 3, 0);
      },
      draw(ctx, e) {
        ctx.rotate(e.angle - Math.PI / 2);
        const armed = e.wait <= 0;
        if (armed) {                                // chama no escape
          ctx.fillStyle = '#ffd43b';
          ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(4, -8); ctx.lineTo(0, -16 - Math.random() * 8); ctx.closePath(); ctx.fill();
          ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.type.color;
        }
        ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(9, -10); ctx.lineTo(0, -4); ctx.lineTo(-9, -10); ctx.closePath(); ctx.fill();
        if (armed && Math.floor(e.t * 12) % 2 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(-1.5, 2, 3, 6); }   // luz de alerta
      }
    },

    /* Tanque: lento, muita vida, atira em leque apontando para o jogador. */
    tank: {
      hp: 16, r: 26, score: 600, color: '#74c0fc', drop: 0.6,
      init(e) { e.fire = 1.4; },
      update(e, dt, w) {
        e.y += 38 * dt;
        e.fire -= dt;
        if (e.fire <= 0 && e.y > 20) { e.fire = 2; SD.Fire.fan(e, w, 3, 0.6, e.look, 205, { color: '#a5d8ff' }); }
      },
      draw(ctx, e) {
        ctx.save(); ctx.rotate(e.t * 0.5);
        poly(ctx, 6, e.r); ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#0b2a40'; poly(ctx, 6, e.r * 0.62, -e.t * 0.8); ctx.fill();
        ctx.save(); ctx.rotate(e.look - Math.PI / 2);        // torre que gira mirando no jogador
        ctx.fillStyle = e.flash > 0 ? '#ffffff' : '#a5d8ff';
        ctx.fillRect(-4, 0, 8, e.r + 4);
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  };
})();

SD.Enemy = class {
  constructor(name, x, y) {
    const T = SD.EnemyTypes[name];
    Object.assign(this, { type: T, name, x, y, r: T.r, hp: T.hp, maxHp: T.hp, t: 0, fire: 0.6 + Math.random(), flash: 0, look: Math.PI / 2, dead: false });
    if (T.init) T.init(this);
  }

  update(dt, world) {
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    this.look = SD.Utils.angleTo(this, world.player);
    this.type.update(this, dt, world);
    if (this.y > SD.CONFIG.HEIGHT + 60 || this.y < -120 || this.x < -80 || this.x > SD.CONFIG.WIDTH + 80) this.dead = true;
  }

  /** Retorna true se morreu. */
  damage(n) {
    this.hp -= n;
    this.flash = 0.08;
    SD.Audio.play('hit');
    return this.hp <= 0;
  }

  draw(ctx) {
    const charge = (this.fire > 0 && this.fire < 0.3) ? 1 - this.fire / 0.3 : 0;      // brilha antes de atirar
    const appear = SD.Utils.easeOutBack(Math.min(1, this.t / 0.3));                      // surge crescendo
    const s = appear * (this.flash > 0 ? 1.12 : 1) * (1 + 0.14 * charge);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);
    ctx.fillStyle = this.flash > 0 ? '#ffffff' : this.type.color;
    ctx.shadowColor = this.type.color;
    ctx.shadowBlur = 12 + charge * 22;
    this.type.draw(ctx, this);
    ctx.restore();
  }
};
