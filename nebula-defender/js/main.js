/* PONTO DE ENTRADA: espera a fonte carregar (até 1,5 s) e inicia o jogo. */
(function () {
  const canvas = document.getElementById('game');
  const start = () => SD.Game.init(canvas);

  if (document.fonts && document.fonts.load) {
    Promise.race([
      document.fonts.load('800 20px Orbitron'),
      new Promise(resolve => setTimeout(resolve, 1500))
    ]).then(start, start);
  } else {
    start();
  }

  // pausa automaticamente ao sair da aba/janela
  window.addEventListener('blur', () => {
    if (SD.Game.state === 'playing') SD.Game.setState('paused');
  });
})();
