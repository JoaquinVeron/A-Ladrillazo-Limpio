import Preload from "/scenes/Preload.js";
import Game from "/scenes/Game.js";

const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: 0x179C35,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Preload, Game],
};

// Espera a que la fuente esté cargada antes de crear el juego
document.fonts.load("1em ActionComicsBlack").then(() => {
  window.game = new Phaser.Game(config);
});