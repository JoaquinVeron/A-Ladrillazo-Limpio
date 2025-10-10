export default class Vehiculo extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);
  scene.add.existing(this);
  scene.physics.add.existing(this);

  // Valores por defecto visuales/físicos
  this.setScale(0.25);
  this.setCollideWorldBounds(false);
  this.setImmovable(true);

  // Estado interno
  this._velocidad = 0;
  this._direction = 1; // 1 = hacia abajo (positivo Y), -1 = hacia arriba (negativo Y)
  this.blinkEvent = null;
  this.ultimaFraseChoque = null;
}

// Configura el vehículo después de crearlo
configure({
  velocidad = 600,
  color = 0xffffff,
  direction = 1,      // 1 o -1
  flipY = null,       // true/false o null para derivarlo de direction
  scale = 0.25,
  immovable = true
} = {}) {
  this._velocidad = velocidad;
  this._direction = direction;
  this.setTint(color);
  this.setScale(scale);
  this.setImmovable(immovable);
  this.setDepth(2);

  // velocidad según dirección
  this.setVelocityY(velocidad * direction);

  // flipY si explícito, si no se aplica según direction (ajusta según tu sprite)
  if (flipY === null) {
    this.setFlipY(direction < 0);
  } else {
    this.setFlipY(!!flipY);
  }
}

preUpdate(time, delta) {
  super.preUpdate(time, delta);
  // destruir cuando sale de la pantalla (arriba o abajo)
  const cam = this.scene.cameras.main;
  if (this.y > cam.height + this.height || this.y < -this.height) {
    this.destroy();
  }
}

// Choque
handleCollision(jugador) {
  if (!jugador.Intangible && !jugador.Aturdido) {

    // --- Si el jugador estaba apuntando, cancelar la mira ---
    if (jugador.aiming) {
      jugador.aiming = false;
      if (jugador.aimCursor) {
        jugador.aimCursor.destroy();
        jugador.aimCursor = null;
      }
    }

    jugador.Intangible = true;
    jugador.Aturdido = true;

    const coloresdeTexto = [
      '#ffffff',
      //'#ff0000ff',
      //'#ff6600ff',
      //'#ffff00ff',
    ];

    this.scene.cameras.main.shake(100, 0.005);

    let ladrilloRoto = false;

    // --- Soltar y dispersar ladrillos si tiene ---
    if (jugador.ladrillos && jugador.ladrillos.length > 0) {
      const direccion = this._direction;
      const idxRomper = Phaser.Math.Between(0, jugador.ladrillos.length - 1);

      const ladrillosAProcesar = [...jugador.ladrillos];
      jugador.ladrillos.length = 0;

      ladrillosAProcesar.forEach((ladrillo, i) => {
        if (!ladrilloRoto && i === idxRomper && Phaser.Math.Between(1, 3) === 1) {
          // Frases únicas para ladrillo roto
          const frasesRoto = [
            "NOOO!",
            "EL LADRILLO NO!",
            "CHAU LADRILLO!",
            "VOS PODES CREER?",
            "ME MATO!",
            "NOO, MI LADRILLO!",
            "UH, ME LA MANDE!"
          ];

          if (!this.scene.ultimaFraseRoto) this.scene.ultimaFraseRoto = null;
          let fraseRoto;
          do {
            fraseRoto = Phaser.Utils.Array.GetRandom(frasesRoto);
          } while (fraseRoto === this.scene.ultimaFraseRoto && frasesRoto.length > 1);

          this.scene.ultimaFraseRoto = fraseRoto;

          const txt = this.scene.add.text(ladrillo.x, ladrillo.y - 50, fraseRoto, {
            fontFamily: 'ActionComicsBlack',
            fontSize: '24px',
            color: coloresdeTexto,
            stroke: '#000000ff',
            strokeThickness: 4
          }).setOrigin(0.5).setDepth(2);

          this.scene.tweens.add({
            targets: txt,
            y: txt.y - 100,
            alpha: 0,
            duration: 1500,
            onComplete: () => txt.destroy()
          });

          ladrillo.destroy();
          ladrilloRoto = true;
          return;
        }

        // Dispersar el ladrillo normalmente
        ladrillo.portadorLadrillo = null;
        const offsetX = Phaser.Math.Between(-80, 80);
        const offsetY = Phaser.Math.Between(160, 200) * direccion;
        const destinoX = jugador.x + offsetX;
        const destinoY = jugador.y + offsetY;
        ladrillo.setDepth(0);
        ladrillo.setInteractive();
        ladrillo.body.enable = false;

        this.scene.tweens.add({
          targets: ladrillo,
          x: destinoX,
          y: destinoY,
          angle: Phaser.Math.Between(360, 1080),
          duration: 400,
          ease: 'Cubic.easeOut',
          onComplete: () => {
            ladrillo.body.enable = true;
            this.scene.tweens.add({
              targets: ladrillo,
              angle: ladrillo.angle + Phaser.Math.Between(90, 180),
              duration: 600,
              ease: 'Cubic.easeOut'
            });
            if (
              this.scene &&
              this.scene.toca &&
              this.scene.toca.Ladrillo &&
              this.scene.Celeste &&
              this.scene.Naranja
            ) {
              this.scene.physics.add.overlap(this.scene.Celeste, ladrillo, function () {
                const arr = this.toca.Ladrillo.Celeste;
                if (arr && !arr.includes(ladrillo)) arr.push(ladrillo);
              }, null, this.scene);
              this.scene.physics.add.overlap(this.scene.Naranja, ladrillo, function () {
                const arr = this.toca.Ladrillo.Naranja;
                if (arr && !arr.includes(ladrillo)) arr.push(ladrillo);
              }, null, this.scene);
            }
          }
        });
      });

      jugador.ManosOcupadas = false;
      jugador.llevaLadrillo = false;
    }

    // --- Mostrar mensaje de choque normal SOLO si NO se rompió un ladrillo ---
    if (!ladrilloRoto) {
      const frasesChoque = [
        "UPS!",
        "AUCH!",
        "NOOO!",
        "LAPU!",
        "OTRA VEZ?!",
        "CUIDADO!",
        "ESE DOLIÓ!",
        "MIRA POR DONDE MANEJAS",
        "A DONDE REGALAN EL CARNET?"
      ];

      let frase;
      do {
        frase = Phaser.Utils.Array.GetRandom(frasesChoque);
      } while (frase === this.scene.ultimaFraseChoque && frasesChoque.length > 1);

      this.scene.ultimaFraseChoque = frase;

      const txt = this.scene.add.text(jugador.x, jugador.y - 100, frase, {
        fontFamily: 'ActionComicsBlack',
        fontSize: '24px',
        color: coloresdeTexto,
        stroke: '#000000ff',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(2);

      this.scene.tweens.add({
        targets: txt,
        y: txt.y - 100,
        alpha: 0,
        duration: 1500,
        onComplete: () => txt.destroy()
      });
    }

    // --- El resto del código de parpadeo, timers, etc. VA SIEMPRE ---
    const direccion = this._direction;
    const desplazamientoY = 80 * direccion;
    const destinoY = jugador.y + desplazamientoY;

    jugador.body.enable = false;
    this.scene.tweens.add({
      targets: jugador,
      y: destinoY,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        jugador.body.enable = true;
      }
    });

    jugador.blinkEvent = this.scene.time.addEvent({
      delay: 200,
      callback: () => { jugador.alpha = jugador.alpha === 0.5 ? 1 : 0.5; },
      repeat: 24
    });

    jugador.alpha = 0.5;
    jugador.setTint(0xff0000);

    this.scene.time.delayedCall(3000, () => {
      jugador.Aturdido = false;
      jugador.alpha = 0.5;
      jugador.setTint(0xffffff);
      jugador.body.enable = true;
    });

    this.scene.time.delayedCall(5000, () => {
      jugador.Intangible = false;
      jugador.body.enable = true;
      jugador.alpha = 1;
      if (jugador.blinkEvent) {
        jugador.blinkEvent.remove();
        jugador.blinkEvent = null;
      }
    });
  }
}
}