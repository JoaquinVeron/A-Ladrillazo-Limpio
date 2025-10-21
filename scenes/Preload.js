import { applyFloating } from "../clases/Floating.js";

export default class Preload extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {

    // Ruta base absoluta
    this.load.setPath('./public/assets');
    
    // Imagenes
    this.load.image("A", "A.png");
    this.load.image("Ladrillazo", "Ladrillazo.png");
    this.load.image("Limpio", "Limpio.png");
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
    this.load.image("BotonE", "BotonE.png");
    this.load.image("BotonF", "BotonF.png");
    this.load.image("BotonJ", "BotonJ.png");
    this.load.image("BotonK", "BotonK.png");
    this.load.image("Carretilla", "Carretilla.png");
    this.load.image("Cemento", "Cemento.png");
    this.load.image("Circulo", "Circulo.png");
    this.load.image("Coca", "Coca.png");
    this.load.image("Construccion", "construccion.png");
    this.load.image("Construccion2", "construccion2.png");
    this.load.image("Construccion3", "construccion3.png");
    this.load.image("Construccion4Blanca", "construccion4Blanca.png");
    this.load.image("Construccion4Amarilla", "construccion4Amarilla.png");
    this.load.image("Cuchara", "Cuchara.png");
    this.load.image("Espatula", "Espatula.png");
    this.load.image("Grava", "Grava.png");
    this.load.image("Ladrillos", "Ladrillos.png");
    this.load.image("Ladrillo", "Ladrillo.png");
    this.load.image("Llana", "Llana.png");
    this.load.image("NubesIzq", "NubesIzq.png");
    this.load.image("NubesDer", "NubesDer.png");
    this.load.image("Madera", "Madera.png");
    this.load.image("Menu", "Menu.png");
    this.load.image("Mezcladora", "Mezcladora.png");
    this.load.image("MezcladoraLlena", "MezcladoraLlena.png");
    this.load.image("MiraCeleste", "MiraCeleste.png");
    this.load.image("MiraNaranja", "MiraNaranja.png");
    this.load.image("Pala", "Pala.png");
    this.load.image("Pared", "Pared.png");
    this.load.image("Pausa", "Pausa.png");
    this.load.image("Pasto", "Pasto.png");
    this.load.image("PastoVersus", "PastoVersus.png");
    this.load.image("Pasto2", "Pasto2.png");
    this.load.image("PastoDetalle", "Pastodetalle.png");
    this.load.image("Reloj", "Reloj.png");
    this.load.image("Sombreado", "Sombreado.png");

    // Sonidos
    this.load.audio("1", "1.mp3");
    this.load.audio("2", "2.mp3");
    this.load.audio("3", "3.mp3");
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

// Fondo de pantalla celeste
this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x51eede).setDepth(0);
this.add.image(centerX, centerY, 'Borde').setDepth(2);

this.PantallaNegra = this.add.image(0, - 1080, 'Madera').setOrigin(0, 0).setDepth(1);


this.NubesIzq = this.add.image(-400, centerY + 5, 'NubesIzq');
this.NubesDer = this.add.image(this.cameras.main.width + 400, centerY, 'NubesDer');
this.A = this.add.image(-400, centerY - 275, 'A');
this.Ladrillazo = this.add.image(-400, centerY - 65 , 'Ladrillazo');
this.Limpio = this.add.image(-400, centerY + 200, 'Limpio');
this.circulo = this.add.image(centerX + 400, centerY, 'Circulo').setAlpha(0).setScale(0.95);

// aplicar flotación (puedes ajustar amplitude/duration/rotate)
applyFloating(this.circulo, { amplitude: 6, duration: 6000, rotate: 180, scale: 0.02 });
applyFloating(this.NubesIzq, { amplitude: 12, duration: 6000, rotate: 1.5 });
applyFloating(this.NubesDer, { amplitude: 10, duration: 6500, rotate: -1.5 });
applyFloating(this.A, { amplitude: 6, duration: 3000, rotate: 2, scale: 0.02 });
applyFloating(this.Ladrillazo, { amplitude: 6, duration: 3200, rotate: 2, scale: 0.02 });
applyFloating(this.Limpio, { amplitude: 6, duration: 3400, rotate: 2, scale: 0.02 });

// Animaciones de entrada
this.time.delayedCall(200, () => {
this.tweens.add({
  targets: this.NubesIzq,
  x: 350,
  duration: 700,
  ease: 'Power4'
});
});

this.time.delayedCall(900, () => {
  this.tweens.add({
    targets: this.NubesDer,
    x: centerX + 700,
    duration: 700,
    ease: 'Power4'
  });
});

this.time.delayedCall(1600, () => {
this.tweens.add({
  targets: this.A,
  x: 250,
  duration: 500,
  ease: 'Power4'
  });
  this.sound.play('1');
});

this.time.delayedCall(2100, () => {
this.tweens.add({
  targets: this.Limpio,
  x: 550,
  duration: 500,
  ease: 'Power4'
 });
 this.sound.play('1');
});

this.time.delayedCall(2600, () => {
this.tweens.add({
  targets: this.Ladrillazo,
  x: 350,
  duration: 500,
  ease: 'Power4'
  });
  this.sound.play('3');
});

    // Crear botón para modo cooperativo
    const startButton = this.add.text(centerX + 400, centerY - 150, 'MODO COOPERATIVO', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '40px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6,
      backgroundColor: '#007bff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(0).setInteractive();

    startButton.on('pointerdown', () => {
      //Pantalla negra cae de arriba
      this.tweens.add({
        targets: this.PantallaNegra,
        y: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.time.delayedCall(500, () => {
            this.scene.start("game");
          });
        }
      });
    });

    // Crear botón para modo PVP
    const pvpButton = this.add.text(centerX + 400, centerY, 'MODO VERSUS', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '40px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6,
      backgroundColor: '#e70a0aff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(0).setInteractive();

    pvpButton.on('pointerdown', () => {
      this.scene.start("gameversus");
    });

    // Crear boton para ajustes
    const settingsButton = this.add.text(centerX + 400, centerY + 150, 'AJUSTES', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '40px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6,
      backgroundColor: '#28a745',
      padding: { x: 25, y: 20 }
    }).setOrigin(0.5).setAlpha(0).setInteractive();

    settingsButton.on('pointerdown', () => {
      this.scene.start("Ajustes");
    });

    // Aparecer botones con tweens
    this.tweens.add({
      targets: [this.circulo,startButton, pvpButton, settingsButton],
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      delay: 3200
    });
  };
  }
  