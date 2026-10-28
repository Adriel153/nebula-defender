/* FASE 5 — final: todos os inimigos juntos. */
SD.Levels.push({
  name: 'Núcleo Inimigo',
  subtitle: 'A batalha final',
  colors: { bgTop: '#0d0414', bgBottom: '#240a3d', star: '#e9c5ff', nebula: '#9b4dff' },
  waves: [
    { at: 1,  type: 'zigzag',   count: 6,  interval: 0.4,  x: 'random' },
    { at: 4,  type: 'shooter',  count: 3,  interval: 0.8,  x: 'spread' },
    { at: 10, type: 'tank',     count: 2,  interval: 1.2,  x: 'spread' },
    { at: 12, type: 'kamikaze', count: 6,  interval: 0.4,  x: 'random' },
    { at: 20, type: 'drone',    count: 14, interval: 0.2,  x: 'random' },
    { at: 24, type: 'shooter',  count: 5,  interval: 0.6,  x: 'spread' },
    { at: 30, type: 'tank',     count: 3,  interval: 1.0,  x: 'spread' },
    { at: 32, type: 'kamikaze', count: 8,  interval: 0.35, x: 'random' },
    { at: 40, type: 'zigzag',   count: 10, interval: 0.3,  x: 'random' },
    { at: 44, type: 'shooter',  count: 5,  interval: 0.6,  x: 'spread' },
    { at: 50, type: 'tank',     count: 3,  interval: 0.9,  x: 'spread' },
    { at: 52, type: 'kamikaze', count: 10, interval: 0.3,  x: 'random' }
  ],
  boss: { name: 'IMPERADOR NEBULA', hp: 240, r: 52, color: '#b565ff', core: '#ffe94d', score: 20000, delayMul: 0.9,
          phases: [['aimed', 'spread'], ['spiral', 'twin'], ['radial', 'rain', 'aimed'], ['spiral', 'radial', 'rain', 'spread']] }
});
