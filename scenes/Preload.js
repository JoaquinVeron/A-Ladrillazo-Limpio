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
    this.load.image("Camion2", "public/assets/Camion2.png");
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
    this.load.image("Construccion", "public/assets/Construccion.png");
    this.load.image("Construccion2", "public/assets/Construccion2.png");
    this.load.image("Construccion3", "public/assets/Construccion3.png");
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
    this.load.image("Pared", "public/assets/Pared.png");
    this.load.image("Pasto", "public/assets/Pasto.png");
    this.load.image("Pasto2", "public/assets/Pasto2.png");
    this.load.image("PastoDetalle", "public/assets/PastoDetalle.png");
    this.load.image("Sombreado", "public/assets/Sombreado.png");

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

    // Videos
    this.load.video("Intro", "public/assets/TelevisaPresenta.mp4");
  }

  create() {

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    //Cargar video con volumen a la mitad y luego iniciar escena "game"
    //const introVideo = this.add.video(centerX, centerY, "Intro");
    //introVideo.setOrigin(0.5, 0.5);
    //introVideo.setVolume(0.25);
    //const scaleX = this.cameras.main.width / introVideo.width;
    //const scaleY = this.cameras.main.height / introVideo.height;
    //introVideo.setScale(scaleX, scaleY);
    //introVideo.play(false);

this.add.image(centerX, centerY, 'Pasto2');

    // Crear botón para modo cooperativo
    const startButton = this.add.text(centerX, centerY - 40, 'MODO COOPERATIVO', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '32px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6,
      backgroundColor: '#007bff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start("game");
    });

    // Crear botón para modo PVP
    const pvpButton = this.add.text(centerX, centerY + 100, 'MODO PVP', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '32px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6,
      backgroundColor: '#e70a0aff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    pvpButton.on('pointerdown', () => {
      this.scene.start("gamepvp");
    });
  }
}