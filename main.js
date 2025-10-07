import Game from "/scenes/Game.js";

const config = {
  type: Phaser.AUTO,
  width: 1920,   // Ancho
  height: 1080,   // Alto
  backgroundColor: 0x179C35, // Color de fondo
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
  scene: [Game],
};

window.game = new Phaser.Game(config);