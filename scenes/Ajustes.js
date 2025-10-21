// Ajustes.js
export default class Ajustes extends Phaser.Scene {
  constructor() {
    super("Ajustes");
  }
    create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.add.image(centerX, centerY, 'Pasto2');

    this.add.text(centerX, centerY, 'PROXIMAMENTE', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '72px',
      fill: '#fff',
    }).setOrigin(0.5);

    const backButton = this.add.text(centerX, centerY + 200, 'VOLVER AL MENÚ', {
        fontFamily: 'ActionComicsBlack',
        fontSize: '48px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 6,
        backgroundColor: '#ff5733',
        padding: { x: 25, y: 20 }
      }).setOrigin(0.5).setInteractive();

        backButton.on('pointerdown', () => {
          this.scene.start("preload");
        });
    }
}