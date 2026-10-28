/* FASE 3 — introduz os kamikazes. */
SD.Levels.push({
  name: 'Campo de Minas',
  subtitle: 'Cuidado com os kamikazes',
  colors: { bgTop: '#03100d', bgBottom: '#06302a', star: '#a8ffe6', nebula: '#12c9a0' },
  waves: [
    { at: 1,  type: 'kamikaze', count: 3, interval: 0.8,  x: 'spread' },
    { at: 6,  type: 'drone',    count: 8, interval: 0.3,  x: 'random' },
    { at: 9,  type: 'kamikaze', count: 4, interval: 0.6,  x: 'random' },
    { at: 16, type: 'shooter',  count: 3, interval: 1.0,  x: 'spread' },
    { at: 18, type: 'kamikaze', count: 5, interval: 0.5,  x: 'random' },
    { at: 26, type: 'zigzag',   count: 8, interval: 0.45, x: 'random' },
    { at: 30, type: 'kamikaze', count: 6, interval: 0.45, x: 'spread' },
    { at: 38, type: 'shooter',  count: 4, interval: 0.8,  x: 'spread' },
    { at: 40, type: 'kamikaze', count: 6, interval: 0.4,  x: 'random' }
  ],
  boss: { name: 'ENXAME-MÃE', hp: 120, r: 44, color: '#20e3b2', core: '#e6fff8', score: 7000, delayMul: 1.0,
          phases: [['spiral', 'aimed'], ['spread', 'rain'], ['spiral', 'radial', 'twin']] }
});
