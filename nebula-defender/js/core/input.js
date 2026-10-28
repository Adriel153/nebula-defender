/* CONTROLES: teclado + toque/mouse.
   Para mudar teclas, edite o objeto MAP. */
SD.Input = (() => {
  const keys = {};      // ações mantidas pressionadas
  const pressed = {};   // ações pressionadas NESTE frame (limpo em endFrame)
  const touch = { active: false, x: 0, y: 0, id: null, used: false };

  const MAP = {
    ArrowLeft: 'left',  KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'up',      KeyW: 'up',
    ArrowDown: 'down',  KeyS: 'down',
    Space: 'fire',      KeyZ: 'fire',
    KeyB: 'bomb',       KeyX: 'bomb',
    KeyP: 'pause',      Escape: 'pause',
    Enter: 'confirm',
    KeyM: 'mute'
  };

  function press(a) { if (!keys[a]) pressed[a] = true; keys[a] = true; }

  window.addEventListener('keydown', e => {
    const a = MAP[e.code];
    if (!a) return;
    e.preventDefault();
    press(a);
  });
  window.addEventListener('keyup', e => { const a = MAP[e.code]; if (a) keys[a] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; touch.active = false; });

  function init(canvas) {
    const W = SD.CONFIG.WIDTH, H = SD.CONFIG.HEIGHT;
    const pos = e => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
    };
    canvas.addEventListener('pointerdown', e => {
      const p = pos(e);
      touch.used = true;
      pressed.confirm = true;
      if (p.x > W - 80 && p.y > H - 80) { pressed.bomb = true; return; }      // botão de bomba
      if (p.x > W - 60 && p.y < 50) { pressed.pause = true; return; }          // botão de pausa
      touch.active = true; touch.id = e.pointerId; touch.x = p.x; touch.y = p.y;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    });
    canvas.addEventListener('pointermove', e => {
      if (touch.active && e.pointerId === touch.id) { const p = pos(e); touch.x = p.x; touch.y = p.y; }
    });
    const end = e => { if (e.pointerId === touch.id) touch.active = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  return {
    init, touch,
    down: a => !!keys[a],
    pressed: a => !!pressed[a],
    endFrame() { for (const k in pressed) delete pressed[k]; }
  };
})();
