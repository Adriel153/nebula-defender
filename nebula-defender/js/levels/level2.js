/* FASE 2 — introduz os atiradores. */
SD.Levels.push({
  name: 'Nebulosa Carmesim',
  subtitle: 'Atiradores à vista',
  colors: { bgTop: '#14040d', bgBottom: '#32091f', star: '#ffb3d1', nebula: '#ff2d6f' },
  waves: [
    { at: 1,  type: 'zigzag',  count: 5, interval: 0.6,  x: 'spread' },
    { at: 6,  type: 'shooter', count: 2, interval: 1.2,  x: 'spread' },
    { at: 11, type: 'drone',   count: 8, interval: 0.35, x: 'random' },
    { at: 15, type: 'shooter', count: 3, interval: 1.0,  x: 'spread' },
    { at: 22, type: 'zigzag',  count: 6, interval: 0.5,  x: 0.25 },
    { at: 22, type: 'zigzag',  count: 6, interval: 0.5,  x: 0.75 },
    { at: 30, type: 'shooter', count: 4, interval: 0.8,  x: 'spread' },
    { at: 36, type: 'drone',   count: 12, interval: 0.25, x: 'random' }
  ],
  boss: { name: 'CEIFADORA', hp: 90, r: 42, color: '#ff4fa3', core: '#ffe3f1', score: 5000, delayMul: 1.1,
          phases: [['aimed', 'spread'], ['spread', 'radial'], ['aimed', 'twin', 'radial']] }
});
