/* FASE 4 — introduz os tanques. */
SD.Levels.push({
  name: 'Fortaleza Orbital',
  subtitle: 'Blindagem pesada',
  colors: { bgTop: '#070b16', bgBottom: '#121c3d', star: '#c5d9ff', nebula: '#4f7dff' },
  waves: [
    { at: 1,  type: 'tank',     count: 1, interval: 1,    x: 0.5 },
    { at: 5,  type: 'drone',    count: 10, interval: 0.25, x: 'random' },
    { at: 10, type: 'tank',     count: 2, interval: 1.5,  x: 'spread' },
    { at: 14, type: 'kamikaze', count: 5, interval: 0.5,  x: 'random' },
    { at: 22, type: 'shooter',  count: 4, interval: 0.8,  x: 'spread' },
    { at: 26, type: 'tank',     count: 2, interval: 1.0,  x: 'spread' },
    { at: 30, type: 'zigzag',   count: 8, interval: 0.4,  x: 'random' },
    { at: 38, type: 'tank',     count: 3, interval: 1.2,  x: 'spread' },
    { at: 42, type: 'kamikaze', count: 8, interval: 0.35, x: 'random' }
  ],
  boss: { name: 'BASTIÃO', hp: 160, r: 48, color: '#74c0fc', core: '#ffffff', score: 9000, delayMul: 0.95,
          phases: [['spread', 'twin'], ['radial', 'aimed', 'rain'], ['spiral', 'spread'], ['spiral', 'radial', 'rain']] }
});
