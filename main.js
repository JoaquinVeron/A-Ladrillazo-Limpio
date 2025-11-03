import Preload from "/scenes/Preload.js";
import Game from "/scenes/Game.js";
import HUD from "/clases/HUDCoop.js";
import GameVersus from "./scenes/Versus.js";
import Ajustes from "./scenes/Ajustes.js";
import Phaser from "phaser";


const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  input: {
    gamepad: true,
  },

  physics: {
    default: "arcade",
    arcade: {
    debug: false,
    },
  },
  scene: [Preload, Game, GameVersus, Ajustes, HUD],
};

// Espera a que la fuente esté cargada antes de crear el juego
document.fonts.load("1em ActionComicsBlack").then(() => {
  window.game = new Phaser.Game(config);
});