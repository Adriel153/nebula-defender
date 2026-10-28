# Nebula Defender

Jogo de nave (shoot'em up vertical) feito só com HTML, CSS e JavaScript puro, sem bibliotecas nem build.

## Como jogar
Abra `index.html` no navegador (clique duas vezes, não precisa de servidor).

| Ação | Teclas |
|---|---|
| Mover | Setas ou WASD |
| Atirar | Espaço ou Z |
| Bomba | B ou X |
| Pausar | P ou ESC |
| Som on/off | M |
| Celular/tablet | Arraste para mover (tiro automático), botão B para bomba |

## Estrutura
```
index.html              ordem de carregamento dos scripts
css/style.css           visual da página
js/
  config.js             constantes (tamanho, vidas, velocidade...)
  main.js               ponto de entrada
  core/
    game.js             loop, estados, colisões, pontuação, bomba, câmera
    input.js            CONTROLES (teclado e toque) — edite MAP para trocar teclas
    audio.js            efeitos sonoros sintetizados
    particles.js        partículas
    effects.js          anéis de choque, textos flutuantes, eventos agendados
    background.js       fundo animado (estrelas, nebulosas, warp)
    levelManager.js     lê a fase e agenda inimigos e chefe
    utils.js            matemática, colisão, easings
  entities/
    player.js  enemy.js  boss.js  bullet.js  powerup.js
  levels/
    level1.js ... level5.js   UMA FASE POR ARQUIVO
  ui/
    hud.js              placar, vidas, barra do chefe
    screens.js          menu, intro de fase, pausa, game over, vitória
```

## Como dar manutenção
- **Nova fase:** copie `js/levels/level5.js` para `level6.js`, ajuste ondas e chefe e adicione o `<script>` em `index.html` (depois da fase 5).
- **Novo inimigo:** adicione uma entrada em `SD.EnemyTypes` (`js/entities/enemy.js`) e use o nome em `type:` nas ondas.
- **Novo ataque de chefe:** adicione em `SD.BossPatterns` (`js/entities/boss.js`) e cite o nome em `phases`.
- **Novo item:** adicione em `SD.PowerTypes` e trate em `apply()` (`js/entities/powerup.js`).
- **Equilíbrio:** vidas, velocidade e tempo de escudo ficam em `js/config.js`.
