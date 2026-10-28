/* Namespace global + configurações do jogo. Carregar PRIMEIRO. */
window.SD = window.SD || {};

SD.CONFIG = {
  WIDTH: 480,
  HEIGHT: 720,
  STORAGE_KEY: 'nebulaDefender.highscore',
  EXTRA_LIFE_EVERY: 20000,           // pontos para ganhar uma vida extra
  PLAYER: {
    SPEED: 320,
    FIRE_DELAY: 0.15,
    LIVES: 3, MAX_LIVES: 5,
    BOMBS: 2, MAX_BOMBS: 5,
    INVULN: 2,                       // segundos de invulnerabilidade após ser atingido
    MAX_WEAPON: 4,
    SHIELD_TIME: 7
  }
};

SD.Levels = [];       // cada js/levels/levelN.js adiciona uma fase aqui
SD.EnemyTypes = {};   // definido em js/entities/enemy.js
SD.BossPatterns = {}; // definido em js/entities/boss.js
