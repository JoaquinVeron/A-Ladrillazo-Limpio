export default class Preload extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    // Imagenes
    this.load.image("Calle", "public/assets/Calle.png");
    this.load.image("Celeste1", "public/assets/1.png");
    this.load.image("Naranja2", "public/assets/2.png");
    this.load.image("Celeste", "public/assets/Celeste.png");
    this.load.image("Naranja", "public/assets/Naranja.png");
    this.load.image("Auto", "public/assets/auto.png");
    this.load.image("Camion", "public/assets/Camion.png");
    this.load.image("Construccion", "public/assets/Construccion.png");
    this.load.image("Moto", "public/assets/Moto.png");
    this.load.image("Arena", "public/assets/Arena.png");
    this.load.image("Balde", "public/assets/Balde.png");
    this.load.image("BaldeArena", "public/assets/BaldeArena.png");
    this.load.image("BaldeGrava", "public/assets/BaldeGrava.png");
    this.load.image("BaldeCemento", "public/assets/BaldeCemento.png");
    this.load.image("Barrera", "public/assets/BloqueDivisor.png");
    this.load.image("Borde", "public/assets/Borde.png");
    this.load.image("Carretilla", "public/assets/Carretilla.png");
    this.load.image("Cemento", "public/assets/Cemento.png");
    this.load.image("Coca", "public/assets/Coca.png");
    this.load.image("Cuchara", "public/assets/Cuchara.png");
    this.load.image("Espatula", "public/assets/Espatula.png");
    this.load.image("Grava", "public/assets/Grava.png");
    this.load.image("Ladrillos", "public/assets/Ladrillos.png");
    this.load.image("Ladrillo", "public/assets/Ladrillo.png");
    this.load.image("Llana", "public/assets/Llana.png");
    this.load.image("Mezcladora", "public/assets/Mezcladora.png");
    this.load.image("MezcladoraLlena", "public/assets/MezcladoraLlena.png");
    this.load.image("MiraCeleste", "public/assets/MiraCeleste.png");
    this.load.image("MiraNaranja", "public/assets/MiraNaranja.png");
    this.load.image("Pala", "public/assets/Pala.png");
    this.load.image("Pasto", "public/assets/Pasto.jpg");

    // Sonidos
    this.load.audio("Arena", "public/assets/Arena.mp3");
    this.load.audio("Bocina", "public/assets/Bocina.mp3");
    this.load.audio("Bocina2", "public/assets/Bocina2.mp3");
    this.load.audio("Bocina3", "public/assets/Bocina3.mp3");
    this.load.audio("RecGrava", "public/assets/RecGrava.mp3");
    this.load.audio("SonidoCarretera", "public/assets/SonidoCarretera.mp3");
    this.load.audio("SonidoCarretera2", "public/assets/SonidoCarretera2.mp3");
    this.load.audio("SonidoConstruccion", "public/assets/sonidoConstruccion.mp3");
    this.load.audio("RuidoMoto", "public/assets/mentiraColgala.mp3");
  }

  create() {
      this.scene.start("game");
  }
}