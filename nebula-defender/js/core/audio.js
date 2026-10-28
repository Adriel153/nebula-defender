/* ÁUDIO: efeitos sonoros sintetizados com Web Audio (sem arquivos externos).
   Para criar um som novo, adicione uma entrada em SFX. */
SD.Audio = (() => {
  let ctx = null, master = null, muted = false;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.25;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  }

  function tone(f1, f2, dur, type = 'square', vol = 0.3, delay = 0) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur);
  }

  function noise(dur, vol = 0.4) {
    if (!ctx || muted) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g); g.connect(master); s.start();
  }

  const SFX = {
    shoot:   () => tone(900, 420, 0.07, 'square', 0.07),
    hit:     () => tone(320, 140, 0.05, 'sawtooth', 0.09),
    explode: () => { noise(0.3, 0.35); tone(170, 35, 0.28, 'sawtooth', 0.2); },
    power:   () => { tone(500, 900, 0.09, 'triangle', 0.25); tone(800, 1400, 0.12, 'triangle', 0.25, 0.08); },
    bomb:    () => { noise(0.7, 0.55); tone(110, 25, 0.6, 'sawtooth', 0.35); },
    boss:    () => { tone(90, 60, 0.5, 'sawtooth', 0.35); tone(120, 70, 0.5, 'square', 0.15, 0.1); },
    bossdie: () => { noise(1.2, 0.5); tone(220, 30, 1.1, 'sawtooth', 0.35); },
    warning: () => { for (let i = 0; i < 3; i++) tone(520, 520, 0.18, 'square', 0.15, i * 0.35); },
    levelup: () => { [440, 554, 659, 880].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.25, i * 0.12)); },
    gameover:() => { [440, 370, 311, 233].forEach((f, i) => tone(f, f * 0.9, 0.3, 'sawtooth', 0.22, i * 0.25)); },
    pop:     () => tone(600, 1200, 0.08, 'sine', 0.15),
    select:  () => tone(700, 1000, 0.08, 'square', 0.12)
  };

  return {
    init,
    play(name) { if (SFX[name]) SFX[name](); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; }
  };
})();
