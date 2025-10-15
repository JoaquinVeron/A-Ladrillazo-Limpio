export default class Preload extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {

    // Ruta base absoluta
    this.load.setPath('/assets');
    
    // Imagenes
    this.load.image("Calle", "Calle.png");
    this.load.image("Celeste1", "1.png");
    this.load.image("Naranja2", "2.png");
    this.load.image("Celeste", "Celeste.png");
    this.load.image("Naranja", "Naranja.png");
    this.load.image("Auto", "auto.png");
    this.load.image("Camion", "camion.png");
    this.load.image("Camion2", "camion2.png");
    this.load.image("Moto", "Moto.png");
    this.load.image("Arena", "Arena.png");
    this.load.image("Balde", "Balde.png");
    this.load.image("BaldeArena", "BaldeArena.png");
    this.load.image("BaldeGrava", "BaldeGrava.png");
    this.load.image("BaldeCemento", "BaldeCemento.png");
    this.load.image("Barrera", "BloqueDivisor.png");
    this.load.image("Borde", "Borde.png");
    this.load.image("Carretilla", "Carretilla.png");
    this.load.image("Cemento", "Cemento.png");
    this.load.image("Coca", "Coca.png");
    this.load.image("Construccion", "construccion.png");
    this.load.image("Construccion2", "construccion2.png");
    this.load.image("Construccion3", "construccion3.png");
    this.load.image("Cuchara", "Cuchara.png");
    this.load.image("Espatula", "Espatula.png");
    this.load.image("Grava", "Grava.png");
    this.load.image("Ladrillos", "Ladrillos.png");
    this.load.image("Ladrillo", "Ladrillo.png");
    this.load.image("Llana", "Llana.png");
    this.load.image("Mezcladora", "Mezcladora.png");
    this.load.image("MezcladoraLlena", "MezcladoraLlena.png");
    this.load.image("MiraCeleste", "MiraCeleste.png");
    this.load.image("MiraNaranja", "MiraNaranja.png");
    this.load.image("Pala", "Pala.png");
    this.load.image("Pared", "Pared.png");
    this.load.image("Pasto", "Pasto.png");
    this.load.image("Pasto2", "Pasto2.png");
    this.load.image("PastoDetalle", "Pastodetalle.png");
    this.load.image("Sombreado", "Sombreado.png");

    // Sonidos
    this.load.audio("Arena", "Arena.mp3");
    this.load.audio("Bocina", "Bocina.mp3");
    this.load.audio("Bocina2", "Bocina2.mp3");
    this.load.audio("Bocina3", "Bocina3.mp3");
    this.load.audio("RecGrava", "RecGrava.mp3");
    this.load.audio("SonidoCarretera", "SonidoCarretera.mp3");
    this.load.audio("SonidoCarretera2", "SonidoCarretera2.mp3");
    this.load.audio("SonidoConstruccion", "sonidoConstruccion.mp3");
    this.load.audio("RuidoMoto", "mentiraColgala.mp3");

    // Videos
    this.load.video("Intro", "TelevisaPresenta.mp4");
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