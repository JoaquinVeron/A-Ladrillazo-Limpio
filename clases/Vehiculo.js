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
  this.setDepth(5);

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
    let ladrilloRoto = false;

    // Sacudir camara
    this.scene.cameras.main.shake(
      100, //Duracion
      0.01 //Intensidad
    );

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

          // Delegar texto al UIManager
          if (this.scene.ui && typeof this.scene.ui.showFloatingText === 'function') {
            this.scene.ui.showFloatingText(ladrillo.x, ladrillo.y - 50, fraseRoto);
          } else {
            // fallback local si UIManager no existe
            const txt = this.scene.add.text(ladrillo.x, ladrillo.y - 50, fraseRoto, {
              fontFamily: 'ActionComicsBlack',
              fontSize: '24px',
              color: '#ffffffff',
              stroke: '#000000ff',
              strokeThickness: 4
            }).setOrigin(0.5).setDepth(6);
            this.scene.tweens.add({ targets: txt, y: txt.y - 100, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
          }

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
        ladrillo.setDepth(4);
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
        "CUIDADO!",
        "OTRA VEZ?!",
        "ESE DOLIÓ!",
        "MIRA POR DONDE MANEJAS",
        "A DONDE REGALAN EL CARNET?"
      ];

      let frase;
      do {
        frase = Phaser.Utils.Array.GetRandom(frasesChoque);
      } while (frase === this.scene.ultimaFraseChoque && frasesChoque.length > 1);

      this.scene.ultimaFraseChoque = frase;

      // Delegar al UIManager
      if (this.scene.ui && typeof this.scene.ui.showFloatingText === 'function') {
        this.scene.ui.showFloatingText(jugador.x, jugador.y - 100, frase);
      } else {
        // fallback local
        const txt = this.scene.add.text(jugador.x, jugador.y - 100, frase, {
          fontFamily: 'ActionComicsBlack',
          fontSize: '24px',
          color: '#ffffffff',
          stroke: '#000000ff',
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(6);
        this.scene.tweens.add({ targets: txt, y: txt.y - 100, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
      }
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

// Métodos estáticos para crear spawners desde la escena
static createAutoSpawner({
  scene,
  group,
  centerX,
  centerY,
  CalleIZQCenter,
  CalleDERCenter,
  spawnFn = (scene, group, x, y, key, opts) => scene.spawnVehicle(group, x, y, key, opts)
}) {
  const posVeh = [
    { x: CalleIZQCenter - 80, y: -100 },
    { x: CalleIZQCenter + 80, y: -100 },
    { x: CalleDERCenter - 80, y: 1180 },
    { x: CalleDERCenter + 80, y: 1180 },
  ];

  const randomColor = () => {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const randomDelayAuto = () => Phaser.Math.Between(600, 800);

  scene.time.addEvent({
    delay: randomDelayAuto(),
    loop: true,
    callback: () => {
      let { x, y } = Phaser.Utils.Array.GetRandom(posVeh);
      const direction = y > centerY ? -1 : 1;
      let color = randomColor();

      // check para evitar spawns muy juntos
      const distanciaMinima = 450;
      let puedeGenerar = true;
      group.getChildren().forEach(veh => {
        if (
          Math.abs(veh.x - x) < 10 &&
          ((direction === 1 && veh.y < 200) || (direction === -1 && veh.y > 900)) &&
          Math.abs(veh.y - y) < distanciaMinima
        ) {
          puedeGenerar = false;
        }
      });
      if (!puedeGenerar) return;

      const tipos = ["Auto", "Auto", "Auto","Auto", "Auto","Auto", "Auto", "Camion"];
      let tipo = Phaser.Utils.Array.GetRandom(tipos);

      let velocidad = 600;
      let scale = 0.25;

      let texturaCamion = "Camion";
      if (tipo === "Camion") {
        velocidad = 550;
        color = 0xffffff;
        scale = 0.35;
        if (direction === 1) y -= 60; else y += 60;
        if (x > centerX) texturaCamion = "Camion2";
      }

      const texturaFinal = tipo === "Camion" ? texturaCamion : tipo;

      spawnFn(scene, group, x, y, texturaFinal, {
        velocidad,
        color,
        direction,
        scale,
        immovable: true
      });
    }
  });
}

static createMotoSpawner({
  scene,
  group,
  centerY,
  CalleIZQCenter,
  CalleDERCenter,
  spawnFn = (scene, group, x, y, key, opts) => scene.spawnVehicle(group, x, y, key, opts)
}) {
  const posMotos = [
    { x: CalleIZQCenter, y: -100 },
    { x: CalleDERCenter, y: 1180 },
  ];

  const randomDelayMoto = () => Phaser.Math.Between(2000, 8000);

  scene.time.addEvent({
    delay: randomDelayMoto(),
    loop: true,
    callback: () => {
      const { x, y } = Phaser.Utils.Array.GetRandom(posMotos);
      const direction = y > centerY ? -1 : 1;
      const velocidad = 1000;

      spawnFn(scene, group, x, y, "Moto", {
        velocidad,
        direction,
        scale: 0.25,
        size: { width: 200, height: 350 },
        immovable: true
      });

      if (Phaser.Math.Between(1, 5) === 1) {
        scene.sound.play("RuidoMoto", { volume: 1 });
      }
    }
  });
}

static registerColliders({ scene, autosGroup, motosGroup, jugadoresGroup, balde }) {
    // overlap autos <-> jugadores
    scene.physics.add.overlap(
      autosGroup,
      jugadoresGroup,
      (veh, jugador) => {
        veh.handleCollision(jugador);
        const b = balde || scene.Balde;
        if (b && b.portadorBalde === jugador) b.soltarBalde(jugador);
      },
      (veh, jugador) => !jugador.Intangible,
      scene
    );

    // overlap motos <-> jugadores
    scene.physics.add.overlap(
      motosGroup,
      jugadoresGroup,
      (veh, jugador) => {
        veh.handleCollision(jugador);
        const b = balde || scene.Balde;
        if (b && b.portadorBalde === jugador) b.soltarBalde(jugador);
      },
      (veh, jugador) => !jugador.Intangible,
      scene
    );
  }
}