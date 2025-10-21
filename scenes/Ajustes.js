// Ajustes.js
export default class Ajustes extends Phaser.Scene {
  constructor() {
    super("Ajustes");
  }
    create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.add.image(centerX, centerY, 'Pasto2');
    this.add.image(centerX, centerY, 'Borde').setDepth(3);
    this.PantallaNegra = this.add.image(centerX, centerY, 'Madera').setDepth(2);

    this.tweens.add({
      targets: this.PantallaNegra,
      y: -540,
      duration: 1000,
      ease: 'Power2',
    });

    this.add.image(centerX, centerY, 'Controles').setScale(1);

    // --- Checkbox para mostrar/ocultar botones del HUD ---
    const key = 'showHUDButtons';
    // Por defecto true (si no existe en localStorage)
    const saved = localStorage.getItem(key);
    const showButtons = saved === null ? true : saved === 'true';

    // Título y explicación corta
    const textoTeclas = this.add.text(centerX - 100, centerY + 350, 'MOSTRAR TECLAS EN PARTIDA', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5, 0.5);

    // Representación visual simple del checkbox (rect + texto SI/NO)
    const boxX = textoTeclas.x + 275;
    const boxY = textoTeclas.y;

    const box = this.add.rectangle(boxX, boxY, 120, 56, 0x222222, 0.85).setStrokeStyle(4, 0xffffff).setDepth(1).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    const boxText = this.add.text(boxX, boxY - 7, showButtons ? 'SI' : 'NO', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '28px',
      fill: showButtons ? '#00ff00' : '#ff0000ff'
    }).setOrigin(0.5).setDepth(1);

    // Función para aplicar el cambio: guardar y notificar al HUD
    const apply = (value) => {
      localStorage.setItem(key, value ? 'true' : 'false');
      this.registry.set(key, value);
      boxText.setText(value ? 'SI' : 'NO');
      boxText.setColor(value ? '#00ff00' : '#ff0000ff');

      // Notificar al HUD y al HUD existente si está activo
      try {
        const hud = this.scene.get('HUD');
        if (hud && typeof hud.setButtonsVisible === 'function') {
          hud.setButtonsVisible(value);
        } else {
          // emite evento global como respaldo
          this.game.events.emit('hud:toggle-buttons', value);
        }
      } catch (e) {
        // no bloquear
        console.warn('No pudo notificar HUD:', e);
      }
    };

    // Click para toggle
    box.on('pointerdown', () => {
      const next = !(localStorage.getItem(key) === 'true');
      apply(next);
    });

    // Inicializar registry (por si no existe)
    this.registry.set(key, showButtons);

    // --- resto de botones (volver al menú) ---
    const backButton = this.add.text(centerX, centerY - 200, 'VOLVER AL MENÚ', {
      fontFamily: 'ActionComicsBlack',
      fontSize: '32px',
      fill: '#fff',
      stroke: '#000',
      strokeThickness: 6,
      backgroundColor: '#ff5733',
      padding: { x: 25, y: 20 }
    }).setOrigin(0.5).setInteractive();

    backButton.on('pointerdown', () => {
      this.tweens.add({
        targets: this.PantallaNegra,
        y: 540,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.time.delayedCall(500, () => {
            this.scene.start("preload");
          });
        }
      });
    });
  }
}