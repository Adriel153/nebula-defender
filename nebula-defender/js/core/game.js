/* NÚCLEO DO JOGO: loop principal, estados (menu, intro, playing, paused, levelclear, gameover, victory),
   colisões, pontuação, bomba e efeitos de câmera (tremida, zoom, slow-motion, flash). */
SD.Game = {
  canvas: null, ctx: null, world: null,
  state: 'menu', timer: 0, clock: 0, last: 0,
  levelIndex: 0, score: 0, hi: 0, hiAtStart: 0, bonus: 0, newRecord: false,
  shake: 0, flash: 0, zoom: 0, fade: 1, slow: 0,
  bossWarn: 0, deathTimer: 0, endTimer: 0, fwTimer: 0,

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    SD.Input.init(canvas);
    try { this.hi = +(localStorage.getItem(SD.CONFIG.STORAGE_KEY) || 0); } catch (e) { this.hi = 0; }
    this.world = { player: new SD.Player(), enemies: [], pBullets: [], eBullets: [], powerups: [], boss: null };
    SD.Background.init();
    SD.Background.setLevel(SD.Levels[0]);
    SD.HUD.reset(this);
    requestAnimationFrame(t => { this.last = t; this.loop(t); });
  },

  loop(t) {
    const real = Math.min(0.033, (t - this.last) / 1000 || 0);
    this.last = t;
    let dt = real;
    if (this.slow > 0) { this.slow -= real; dt *= 0.35; }          // câmera lenta (morte do chefe)
    this.update(dt);
    this.draw();
    SD.Input.endFrame();
    requestAnimationFrame(tt => this.loop(tt));
  },

  setState(s) { this.state = s; this.timer = 0; },
  addShake(n) { this.shake = Math.max(this.shake, n); },
  hudPulse(what) { SD.HUD.pulse(what); },

  /* ---------- fluxo de jogo ---------- */
  resetWorld() {
    const w = this.world;
    w.enemies.length = 0; w.pBullets.length = 0; w.eBullets.length = 0; w.powerups.length = 0; w.boss = null;
    SD.Particles.clear(); SD.FX.clear();
  },

  newGame() {
    SD.Audio.init();
    this.score = 0; this.newRecord = false; this.hiAtStart = this.hi; this.deathTimer = 0;
    this.world.player.reset();
    SD.HUD.reset(this);
    this.startLevel(0);
  },

  startLevel(i) {
    this.levelIndex = i;
    this.resetWorld();
    SD.LevelManager.load(i);
    SD.Background.setLevel(SD.Levels[i]);
    SD.Background.warp = 8;                                      // efeito de hiperespaço
    SD.Fire.mul = 1 + i * 0.08;                                  // tiros mais rápidos a cada fase
    this.endTimer = 0; this.bossWarn = 0; this.fade = 1;
    this.world.player.enter();
    this.setState('intro');
  },

  goMenu() {
    this.resetWorld();
    this.world.player.reset();
    SD.Background.setLevel(SD.Levels[0]);
    SD.HUD.reset(this);
    this.fade = 1;
    this.setState('menu');
  },

  announceBoss() { this.bossWarn = 2.4; this.addShake(4); SD.Audio.play('warning'); },

  /* ---------- atualização ---------- */
  update(dt) {
    const I = SD.Input;
    if (I.pressed('mute')) SD.Audio.toggleMute();

    if (this.state === 'paused') {
      this.clock += dt; this.timer += dt;
      if (I.pressed('pause') || I.pressed('confirm')) { this.state = 'playing'; this.timer = 0; }
      return;
    }

    this.clock += dt; this.timer += dt;
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt * 2.2);
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 40);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.8);
    if (this.zoom > 0) this.zoom = Math.max(0, this.zoom - dt * 0.5);
    if (this.bossWarn > 0) this.bossWarn -= dt;
    SD.Background.update(dt);
    SD.FX.update(dt);
    SD.Particles.update(dt);
    SD.HUD.update(dt, this);

    switch (this.state) {
      case 'menu': {
        const s = SD.Screens.menuShip(this);
        if (Math.random() < 0.7) SD.Particles.trail(s.x, s.y + 13, '#ff9f43', 2.5, 90);
        if (I.pressed('confirm') || I.pressed('fire')) { SD.Audio.init(); SD.Audio.play('select'); this.newGame(); }
        break;
      }
      case 'intro':
        this.updatePlaying(dt, false);
        if (this.timer > SD.Screens.INTRO_TIME) this.setState('playing');
        break;
      case 'playing':
        if (I.pressed('pause')) { this.setState('paused'); break; }
        this.updatePlaying(dt, true);
        break;
      case 'levelclear':
        this.updatePlaying(dt, false);
        if (this.timer > 4 || (this.timer > 1.5 && I.pressed('confirm'))) {
          if (this.levelIndex + 1 < SD.Levels.length) this.startLevel(this.levelIndex + 1);
          else this.victory();
        }
        break;
      case 'victory':
        this.updatePlaying(dt, false);
        this.fwTimer -= dt;                                       // fogos de artifício
        if (this.fwTimer <= 0) {
          this.fwTimer = 0.28;
          const x = SD.Utils.rand(60, 420), y = SD.Utils.rand(90, 360);
          const c = SD.Utils.pick(['#ff4fd8', '#59f3ff', '#ffd43b', '#7fffd4', '#ff9f43']);
          SD.Particles.burst(x, y, c, 44, 260, 3);
          SD.FX.ring(x, y, c, 80, 0.7, 3);
          SD.Audio.play('pop');
        }
        if (this.timer > 3 && (I.pressed('confirm') || I.pressed('fire'))) this.goMenu();
        break;
      case 'gameover':
        if (this.timer > 2.2 && (I.pressed('confirm') || I.pressed('fire'))) this.goMenu();
        break;
    }
  },

  updatePlaying(dt, spawn) {
    const w = this.world, p = w.player, I = SD.Input;
    if (!p.dead) {
      p.update(dt, w);
      if (!p.entering && I.pressed('bomb') && this.state === 'playing') this.useBomb();
    }
    if (spawn) SD.LevelManager.update(dt, w);
    w.enemies.forEach(e => e.update(dt, w));
    if (w.boss) w.boss.update(dt, w);
    w.pBullets.forEach(b => b.update(dt));
    w.eBullets.forEach(b => b.update(dt));
    w.powerups.forEach(u => u.update(dt, w));
    this.collide();
    for (const arr of [w.enemies, w.pBullets, w.eBullets, w.powerups]) this.sweep(arr);

    if (p.dead) {
      this.deathTimer += dt;
      if (this.deathTimer > 1.6 && this.state === 'playing') this.gameOver();
    } else if (spawn && SD.LevelManager.done) {
      this.endTimer += dt;
      if (this.endTimer > (SD.LevelManager.level.boss ? 2.6 : 0.8)) this.onLevelClear();   // deixa a explosão do chefe terminar
    }
  },

  sweep(a) { let j = 0; for (let i = 0; i < a.length; i++) if (!a[i].dead) a[j++] = a[i]; a.length = j; },

  collide() {
    const w = this.world, p = w.player, U = SD.Utils;
    for (const b of w.pBullets) {
      if (b.dead) continue;
      for (const e of w.enemies) {
        if (!e.dead && U.overlap(b, e)) {
          b.dead = true;
          SD.Particles.burst(b.x, b.y, '#aaffff', 3, 90, 2);
          if (e.damage(b.damage)) this.killEnemy(e);
          break;
        }
      }
      if (!b.dead && w.boss && w.boss.vulnerable && U.overlap(b, w.boss)) {
        b.dead = true;
        SD.Particles.burst(b.x, b.y, '#ffffff', 3, 100, 2);
        SD.Audio.play('hit');
        if (w.boss.damage(b.damage)) this.killBoss();
      }
    }
    if (p.dead) return;
    const hb = { x: p.x, y: p.y, r: 5 };                           // hitbox pequena para tiros (mais justo)
    for (const b of w.eBullets) if (!b.dead && U.overlap(b, hb) && p.hurt()) b.dead = true;
    for (const e of w.enemies) {
      if (!e.dead && U.overlap(e, p) && p.hurt() && e.damage(3)) this.killEnemy(e);
    }
    if (w.boss && U.overlap(w.boss, { x: p.x, y: p.y, r: p.r * 0.6 })) p.hurt();
    if (!p.entering) for (const u of w.powerups) if (!u.dead && U.overlap(u, p)) { u.dead = true; u.apply(p); }
  },

  /* ---------- eventos ---------- */
  addScore(n) {
    const before = this.score;
    this.score += n;
    if (this.score > this.hi) this.hi = this.score;
    const E = SD.CONFIG.EXTRA_LIFE_EVERY, p = this.world.player;
    if (Math.floor(this.score / E) > Math.floor(before / E) && p.lives < SD.CONFIG.PLAYER.MAX_LIVES) {
      p.lives++;
      SD.FX.text(p.x, p.y - 40, 'VIDA EXTRA!', '#ff4fd8', 16);
      SD.FX.ring(p.x, p.y, '#ff4fd8', 70, 0.6, 3);
      SD.Audio.play('power');
    }
  },

  killEnemy(e) {
    e.dead = true;
    this.addScore(e.type.score);
    SD.Particles.burst(e.x, e.y, e.type.color, 18, 190, 3);
    SD.Particles.burst(e.x, e.y, '#ffffff', 6, 120, 2);
    SD.FX.ring(e.x, e.y, e.type.color, e.r * 2.6, 0.45, 3);
    SD.FX.text(e.x, e.y - e.r, '+' + e.type.score, '#ffffff', 12);
    SD.Audio.play('explode');
    this.addShake(e.r > 20 ? 6 : 2);
    if (Math.random() < e.type.drop) this.dropPowerup(e.x, e.y);
  },

  killBoss() {
    const w = this.world, b = w.boss, U = SD.Utils;
    this.addScore(b.cfg.score);
    w.boss = null;
    w.eBullets.forEach(x => { x.dead = true; SD.Particles.burst(x.x, x.y, '#ffffff', 2, 60, 2); });
    w.enemies.forEach(e => { e.dead = true; SD.Particles.burst(e.x, e.y, e.type.color, 10, 150, 3); });
    this.slow = 1.2; this.flash = 0.6; this.zoom = 0.07; this.addShake(20);
    SD.Audio.play('bossdie');
    for (let i = 0; i < 12; i++) SD.FX.later(i * 0.1, () => {       // cadeia de explosões
      const x = b.x + U.rand(-b.r, b.r), y = b.y + U.rand(-b.r * 0.7, b.r * 0.7);
      SD.Particles.burst(x, y, i % 2 ? b.cfg.color : '#ffffff', 28, 280, 4);
      SD.FX.ring(x, y, b.cfg.color, 60 + i * 8, 0.6, 3);
      this.addShake(8); SD.Audio.play('explode');
    });
    SD.FX.later(1.2, () => {                                         // explosão final
      SD.FX.ring(b.x, b.y, '#ffffff', 420, 0.9, 8);
      SD.Particles.burst(b.x, b.y, '#ffffff', 60, 420, 4);
      this.flash = 0.8; this.addShake(16);
    });
    SD.FX.text(b.x, b.y, '+' + b.cfg.score, '#ffd43b', 22);
    this.dropPowerup(b.x - 30, b.y, 'weapon');
    this.dropPowerup(b.x + 30, b.y, 'shield');
  },

  dropPowerup(x, y, kind) {
    if (!kind) { const r = Math.random(); kind = r < 0.4 ? 'weapon' : r < 0.65 ? 'shield' : r < 0.85 ? 'bomb' : 'life'; }
    this.world.powerups.push(new SD.PowerUp(kind, x, y));
    SD.FX.ring(x, y, SD.PowerTypes[kind].color, 30, 0.35, 2);
  },

  useBomb() {
    const w = this.world, p = w.player;
    if (p.bombs <= 0) return;
    p.bombs--;
    p.invuln = Math.max(p.invuln, 1);
    w.eBullets.forEach(b => { b.dead = true; SD.Particles.burst(b.x, b.y, '#ffd43b', 2, 70, 2); });
    w.enemies.forEach(e => { if (e.damage(12)) this.killEnemy(e); });
    if (w.boss && w.boss.vulnerable && w.boss.damage(20)) this.killBoss();
    SD.FX.ring(p.x, p.y, '#ffd43b', 900, 0.8, 10);
    SD.FX.ring(p.x, p.y, '#ffffff', 700, 0.6, 5, 0.1);
    this.flash = 0.4; this.zoom = 0.05; this.addShake(14);
    SD.Audio.play('bomb');
  },

  onLevelClear() {
    const p = this.world.player;
    this.bonus = 1000 + p.lives * 500;
    this.addScore(this.bonus);
    for (let i = 0; i < 6; i++) SD.FX.later(i * 0.15, () => {         // confete
      const x = SD.Utils.rand(60, 420), y = SD.Utils.rand(120, 400);
      const c = SD.Utils.pick(['#ff4fd8', '#59f3ff', '#ffd43b', '#7fffd4']);
      SD.Particles.burst(x, y, c, 30, 220, 3); SD.Audio.play('pop');
    });
    SD.Audio.play('levelup');
    this.setState('levelclear');
  },

  saveHi() {
    this.newRecord = this.score > this.hiAtStart;
    try { localStorage.setItem(SD.CONFIG.STORAGE_KEY, String(this.hi)); } catch (e) {}
  },

  victory() {
    this.saveHi();
    this.fwTimer = 0;
    this.flash = 0.5;
    SD.Audio.play('levelup');
    this.setState('victory');
  },

  gameOver() {
    this.saveHi();
    SD.Audio.play('gameover');
    this.setState('gameover');
  },

  /* ---------- desenho ---------- */
  draw() {
    const ctx = this.ctx, W = SD.CONFIG.WIDTH, H = SD.CONFIG.HEIGHT, w = this.world;
    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake * 2, (Math.random() - 0.5) * this.shake * 2);
    if (this.zoom > 0) { const z = 1 + this.zoom; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
    SD.Background.draw(ctx);
    if (this.state !== 'menu') {
      w.powerups.forEach(o => o.draw(ctx));
      w.enemies.forEach(o => o.draw(ctx));
      if (w.boss) w.boss.draw(ctx);
      w.pBullets.forEach(o => o.draw(ctx));
      w.eBullets.forEach(o => o.draw(ctx));
      w.player.draw(ctx);
    }
    SD.Particles.draw(ctx);
    SD.FX.draw(ctx);
    ctx.restore();

    if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, this.flash) * 0.8})`; ctx.fillRect(0, 0, W, H); }
    if (this.state !== 'menu') SD.HUD.draw(ctx, this);

    const S = SD.Screens;
    switch (this.state) {
      case 'menu': S.menu(ctx, this); break;
      case 'intro': S.intro(ctx, this); break;
      case 'paused': S.paused(ctx, this); break;
      case 'levelclear': S.levelClear(ctx, this); break;
      case 'gameover': S.gameOver(ctx, this); break;
      case 'victory': S.victory(ctx, this); break;
    }
    if (this.bossWarn > 0 && this.state === 'playing') S.bossWarning(ctx, this);
    if (this.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${this.fade})`; ctx.fillRect(0, 0, W, H); }
  }
};
