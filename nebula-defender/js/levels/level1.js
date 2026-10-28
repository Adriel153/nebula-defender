/* FASE 1 — modelo para criar novas fases.
   waves: { at: segundo em que começa, type: tipo de inimigo, count, interval: entre inimigos,
            x: 'spread' | 'random' | número de 0 a 1 (posição horizontal) }
   boss:  { name, hp, r, color, core, score, delayMul, phases: [[padrões da fase 1], [padrões da fase 2], ...] } */
SD.Levels.push({
  name: 'Cinturão Inicial',
  subtitle: 'Defenda a fronteira',
  colors: { bgTop: '#050816', bgBottom: '#0a1a3a', star: '#9fd8ff', nebula: '#2b4cff' },
  waves: [
    { at: 1,  type: 'drone',  count: 5,  interval: 0.6,  x: 'spread' },
    { at: 6,  type: 'drone',  count: 6,  interval: 0.4,  x: 'random' },
    { at: 11, type: 'zigzag', count: 4,  interval: 0.9,  x: 0.3 },
    { at: 11, type: 'zigzag', count: 4,  interval: 0.9,  x: 0.7 },
    { at: 19, type: 'drone',  count: 8,  interval: 0.35, x: 'spread' },
    { at: 24, type: 'zigzag', count: 6,  interval: 0.7,  x: 'random' },
    { at: 32, type: 'drone',  count: 10, interval: 0.3,  x: 'random' }
  ],
  boss: { name: 'SENTINELA', hp: 60, r: 40, color: '#ff6b6b', core: '#ffffff', score: 3000, delayMul: 1.2,
          phases: [['aimed', 'spread'], ['spread', 'twin']] }
});
