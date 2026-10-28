/* GERENTE DE FASE: lê a descrição da fase (js/levels/levelN.js), agenda os inimigos,
   chama o chefe no fim e avisa quando a fase termina. */
SD.LevelManager = {
  level: null, time: 0, queue: [], bossSpawned: false, bossDelay: 0, done: false,

  load(index) {
    const W = SD.CONFIG.WIDTH;
    this.level = SD.Levels[index];
    this.time = 0; this.bossSpawned = false; this.bossDelay = 0; this.done = false;
    this.queue = [];
    for (const w of this.level.waves) {
      for (let k = 0; k < w.count; k++) {
        let fx;
        if (w.x === 'spread') fx = (k + 1) / (w.count + 1);
        else if (w.x === undefined || w.x === 'random') fx = 0.08 + Math.random() * 0.84;
        else fx = w.x;
        this.queue.push({ at: w.at + k * (w.interval || 0.5), type: w.type, x: fx * W });
      }
    }
    this.queue.sort((a, b) => a.at - b.at);
  },

  update(dt, world) {
    if (this.done) return;
    this.time += dt;
    while (this.queue.length && this.queue[0].at <= this.time) {
      const s = this.queue.shift();
      world.enemies.push(new SD.Enemy(s.type, s.x, -30));
    }
    const cleared = !this.queue.length && !world.enemies.length;
    const boss = this.level.boss;
    if (boss) {
      if (cleared && !this.bossSpawned) {
        this.bossDelay += dt;
        if (this.bossDelay > 1.5) {
          world.boss = new SD.Boss(boss);
          this.bossSpawned = true;
          SD.Game.announceBoss();
        }
      } else if (this.bossSpawned && !world.boss) this.done = true;
    } else if (cleared) this.done = true;
  }
};
