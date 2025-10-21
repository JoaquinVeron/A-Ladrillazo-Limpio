export default class Jugador extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);
  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setCollideWorldBounds(true).setScale(0.3).refreshBody();
  this.ladrillos = [];
  this.velocidadBase = 250;

  // estado extra
  this.aiming = false;
  this.aimCursor = null;
  this.ManosOcupadas = false;
  this.llevaLadrillo = false;
  this.llevaBalde = false;
  this.Intangible = false;
  this.Aturdido = false;
  this.vaciarTimer = null;
}

Mover(teclas, correrKey) {
    const scene = this.scene;
    const base = this.velocidadBase;
    let speed = base;

    // 1. Si lleva el balde lleno, velocidad fija 150
    if (this.llevaBalde && scene.Balde && scene.Balde.lleno) {
      speed = 150;
    }
    // 2. Si tiene ladrillos, reducir por ladrillo
    else if (this.ladrillos && this.ladrillos.length > 0) {
      speed = this.velocidadBase - 45 * this.ladrillos.length;
      if (speed < 60) speed = 60;
    }

    // --- Si el jugador está apuntando, mover la mira (IGNORAR SHIFT) ---
    if (this.aiming) {
      if (!this.aimCursor || !this.aimCursor.scene) {
        const texturaMira = (this.texture && this.texture.key === "Naranja") ? "MiraNaranja" : "MiraCeleste";
        this.aimCursor = scene.add.image(this.x + 80, this.y, texturaMira)
          .setScale(0.25)
          .setDepth(6)
          .setAlpha(0.95);
      }

      // movimiento de la mira con la misma velocidad base (NO afecta SHIFT)
      const aimSpeed = 1000;
      let moveX = 0, moveY = 0;
      if (teclas.izq.isDown) moveX = -aimSpeed;
      else if (teclas.der.isDown) moveX = aimSpeed;
      if (teclas.arriba.isDown) moveY = -aimSpeed;
      else if (teclas.abajo.isDown) moveY = aimSpeed;

      const delta = (scene.game && scene.game.loop && scene.game.loop.delta) ? scene.game.loop.delta / 1000 : 0.016;
      this.aimCursor.x += moveX * delta;
      this.aimCursor.y += moveY * delta;

      const cam = scene.cameras.main;
      const minX = cam.scrollX + 20;
      const maxX = cam.scrollX + cam.displayWidth - 20;
      const minY = cam.scrollY + 20;
      const maxY = cam.scrollY + cam.displayHeight - 20;
      this.aimCursor.x = Phaser.Math.Clamp(this.aimCursor.x, minX, maxX);
      this.aimCursor.y = Phaser.Math.Clamp(this.aimCursor.y, minY, maxY);

      // jugador completamente quieto mientras apunta
      this.setVelocity(0, 0);
      return;
    }

    // Movimiento normal del jugador (SHIFT aumenta velocidad)
    if (!this.Aturdido) {
      let velX = 0, velY = 0;

      if (teclas.izq.isDown) {
        velX = -speed;
        this.setFlipX(false);
      } else if (teclas.der.isDown) {
        velX = speed;
        this.setFlipX(true);
      }

      if (teclas.arriba.isDown) {
        velY = -speed;
      } else if (teclas.abajo.isDown) {
        velY = speed;
      }

      // SHIFT (o correrKey) solo afecta al jugador, no a la mira
      if (correrKey && correrKey.isDown) {
        velX *= 1.5;
        velY *= 1.5;
      }

      this.setVelocityX(velX);
      this.setVelocityY(velY);
    } else {
      this.setVelocity(0);
    }
}

interactuar(tecla) {
    // No permitir interacciones mientras apunta
    if (this.aiming) return;

    if (Phaser.Input.Keyboard.JustDown(tecla)) {
      const scene = this.scene;

      // Balde
      if (scene.physics.overlap(this, scene.Balde)) {
        scene.Balde.interactuarBalde(this, tecla);
      }
      // Pila de ladrillos
      else if (
        scene.physics.overlap(this, scene.Ladrillos) &&
        this.ladrillos.length < 3 &&
        !this.Aturdido &&
        !this.ManosOcupadas
      ) {
        scene.Ladrillos.levantarLadrillo(this);
      }
      // Ladrillo individual en el suelo
      else if (
        scene.toca &&
        scene.toca.Ladrillo &&
        scene.toca.Ladrillo[this.texture.key] &&
        scene.toca.Ladrillo[this.texture.key].length > 0 &&
        this.ladrillos.length < 3 &&
        !this.Aturdido
      ) {
        const ladrillo = scene.toca.Ladrillo[this.texture.key][0];
        ladrillo.levantarLadrilloSuelo(this, ladrillo);
      }
      // Soltar ladrillo si no está tocando la pila
      else if (
        !scene.physics.overlap(this, scene.Ladrillos) &&
        this.ladrillos.length > 0
      ) {
        this.ladrillos[this.ladrillos.length - 1].soltarLadrillo(this);
      }
    }
}

interactuarConstruccion(tecla) {
    if (this.aiming) return;
    if (!Phaser.Input.Keyboard.JustDown(tecla)) return;
    const scene = this.scene;

    if (
      scene.physics.overlap(this, scene.Construccion) &&
      this.llevaBalde &&
      scene.Balde.lleno &&
      scene.Balde.texture.key === "BaldeCemento"
    ) {
      scene.Construccion.recibirCemento(this);
    }
    else if (
      scene.physics.overlap(this, scene.Construccion) &&
      this.ladrillos.length > 0
    ) {
      scene.Construccion.recibirLadrillo(this);
    }
}

interactuarMaterial(tecla, material) {
    if (this.aiming) return;
    const scene = this.scene;
    if (
      scene.physics.overlap(this, material) &&
      this.llevaBalde
    ) {
      scene.Balde.llenarBalde(this, tecla, material);
    }
}

interactuarMezcladora(tecla) {
    if (this.aiming) return;
    const scene = this.scene;
    if (
      scene.physics.overlap(this, scene.Mezcladora) &&
      this.llevaBalde
    ) {
      if (scene.Balde.texture.key === "BaldeArena") {
        scene.Mezcladora.cargarMaquina(this, tecla, scene.Arena);
      } else if (scene.Balde.texture.key === "BaldeGrava") {
        scene.Mezcladora.cargarMaquina(this, tecla, scene.Grava);
      }
    }
}

interactuarLadrillo(tecla) {
    const scene = this.scene;
    if (scene.physics.overlap(this, scene.Construccion)) return;

    if (Phaser.Input.Keyboard.JustDown(tecla)) {
      if (this.aiming) {
        this.lanzarLadrillo();
      } else {
        this.startAiming();
      }
    }
}

startAiming() {
  // Si no hay ladrillos o ya está en modo apuntado, nada que hacer
  if (!this.ladrillos || this.ladrillos.length === 0) return;
  if (this.aiming) return;
  this.aiming = true;

  const scene = this.scene;

  // Elegir textura de mira según jugador (ajustá los nombres si cambias texturas)
  // Si el jugador no es "Naranja", por defecto usamos "MiraCeleste"
  const texturaMira = (this.texture && this.texture.key === "Naranja") ? "MiraNaranja" : "MiraCeleste";

  // Si no existe la mira, la creamos; si existe, la reaprovechamos y aseguramos la textura correcta
  if (!this.aimCursor || !this.aimCursor.scene) {
    this.aimCursor = scene.add.image(this.x, this.y, texturaMira)
      .setScale(0.25)
      .setDepth(6)
      .setAlpha(0.95);
  } else {
    // Si existe pero con otra textura, actualizamos la textura
    if (this.aimCursor.texture && this.aimCursor.texture.key !== texturaMira) {
      this.aimCursor.setTexture(texturaMira);
    }
    this.aimCursor.setVisible(true);
    this.aimCursor.x = this.x + 80;
    this.aimCursor.y = this.y;
  }

  // Detener movimiento al empezar a apuntar
  this.setVelocity(0);
}

cancelAiming() {
  this.aiming = false;
  if (this.aimCursor) {
    this.aimCursor.destroy();
    this.aimCursor = null;
  }
}

lanzarLadrillo() {
    const scene = this.scene;

    // si no hay ladrillos, cancelar apuntado y salir
    if (!this.ladrillos || this.ladrillos.length === 0) {
      this.cancelAiming();
      return;
    }

    // Si está sobre la construcción, dejar el ladrillo ahí
    if (scene.physics.overlap(this, scene.Construccion)) {
      scene.Construccion.recibirLadrillo(this);
      this.cancelAiming();
      return;
    }

    // Sacar el último ladrillo del array
    const ladrillo = this.ladrillos.pop();
    if (!ladrillo) {
      this.cancelAiming();
      return;
    }

    // actualizar estados del jugador que lanzó
    if (this.ladrillos.length === 0) {
      this.ManosOcupadas = false;
      this.llevaLadrillo = false;
    }

    // poner ladrillo en la mano y marcar meta
    ladrillo.portadorLadrillo = null;
    ladrillo.x = this.x + 20;
    ladrillo.y = this.y;
    ladrillo.setDepth(6);
    ladrillo.setRotation(0);
    ladrillo.thrower = this; // para no afectarse a sí mismo
    ladrillo.thrown = true;  // indicamos que fue lanzado (se rompe)
    ladrillo._pufMostrado = false; // marcar para evitar múltiples PUFs

    // activar física del ladrillo
    if (ladrillo.body) {
      ladrillo.body.enable = true;
      ladrillo.setCollideWorldBounds(true);
      ladrillo.body.onWorldBounds = true;
      ladrillo.setBounce(0.35);
    }

    const targetX = this.aimCursor ? this.aimCursor.x : this.x + 200;
    const targetY = this.aimCursor ? this.aimCursor.y : this.y;

    // helper: texto "PUF" suave (se usa siempre que se destruya el ladrillo)
    const mostrarPUF = (x, y) => {
      if (typeof x !== 'number' || typeof y !== 'number') return;
      const texto = scene.add.text(x, y, "BONK", {
        fontFamily: 'ActionComicsBlack',
        fontSize: '28px',
        color: '#d63c15ff',
        stroke: '#000000',
        strokeThickness: 4
      }).setDepth(6).setOrigin(0.5);
      // sube y se desvanece: cambiar ease/duration para ajustar sensación
      scene.tweens.add({
        targets: texto,
        y: y - 30,
        alpha: 0,
        duration: 1500,
        ease: 'Cubic.easeOut', // prueba 'Sine.easeOut' para más suave
        onComplete: () => {
          if (texto && texto.destroy) texto.destroy();
        }
      });
    };

    // función única para destruir y mostrar PUF sólo una vez
    let onWorld = null;
    const destruirLadrilloUnaVez = (l) => {
      if (!l || l._pufMostrado) return; // si ya mostramos PUF, no hacemos nada
      l._pufMostrado = true;
      // quitar listener de worldbounds si existe (seguridad)
      if (onWorld) scene.physics.world.off('worldbounds', onWorld);
      // mostrar PUF en la posición actual y destruir con seguridad
      if (l && l.x != null && l.y != null) mostrarPUF(l.x, l.y);
      if (l && l.destroy) l.destroy();
    };

    // --- Empuje suave al jugador que recibe el impacto ---
    const aplicarNoqueo = (jugadorObjetivo, l) => {
      if (!jugadorObjetivo || jugadorObjetivo === ladrillo.thrower) return;
      if (jugadorObjetivo.Intangible || jugadorObjetivo.Aturdido) return;

      // MARCAR inmediatamente como aturdido e intangible para bloquear entradas YA
      jugadorObjetivo.Intangible = true; // evita re-impactos repetidos
      jugadorObjetivo.Aturdido = true;   // tu código de movimiento debe respetar este flag
      jugadorObjetivo.setTint(0xff0000); // efecto visual inmediato

      if (jugadorObjetivo.body && l) {
        const dx = jugadorObjetivo.x - l.x;
        const dy = jugadorObjetivo.y - l.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const nx = dx / dist;
        const ny = dy / dist;

        // Ajustes: si sigue yéndose mucho, bajar fuerzaEmpujon o maxVel
        const fuerzaEmpujon = 100;    // <- ajustá entre 60..140
        const mulVertical = 0.22;     // <- baja para que no salte tanto
        const duracionTweenEmpujon = 120; // ms, duración del empujón visible

        const startVx = jugadorObjetivo.body.velocity.x;
        const startVy = jugadorObjetivo.body.velocity.y;
        let targetVx = startVx + nx * fuerzaEmpujon;
        let targetVy = startVy + ny * (fuerzaEmpujon * mulVertical);

        // limitar velocidad final para que no lo saque del mapa
        const maxVelPermitida = 200;
        const mag = Math.hypot(targetVx, targetVy);
        if (mag > maxVelPermitida) {
          const s = maxVelPermitida / mag;
          targetVx *= s;
          targetVy *= s;
        }

        // Tween que interpola la velocidad (el body sigue activo para que la física mueva)
        scene.tweens.addCounter({
          from: 0,
          to: 1,
          duration: duracionTweenEmpujon,
          ease: 'Quad.easeOut',
          onUpdate: (tween) => {
            const v = tween.getValue();
            if (jugadorObjetivo && jugadorObjetivo.body) {
              jugadorObjetivo.body.velocity.x = startVx + (targetVx - startVx) * v;
              jugadorObjetivo.body.velocity.y = startVy + (targetVy - startVy) * v;
            }
          },
          onComplete: () => {
            // No desactivar body (evita atravesar barreras). Dejamos la velocidad aplicada y
            // programamos la recuperación normal.
            if (jugadorObjetivo && jugadorObjetivo.body) {
              // opcional: frenar suavemente
              jugadorObjetivo.setVelocity(0, 0);
            }

            // restaurar después de 2s (cambiar si querés menos/más tiempo)
            scene.time.delayedCall(2000, () => {
              jugadorObjetivo.Aturdido = false;
              jugadorObjetivo.Intangible = false;
              jugadorObjetivo.setTint(0xffffff);
              jugadorObjetivo.alpha = 1;
              // no tocamos body.enable aquí
            });
          }
        });
      } else {
        // si no hay body o no podemos empujar, igual iniciar el timer para restaurar
        scene.time.delayedCall(2000, () => {
          jugadorObjetivo.Aturdido = false;
          jugadorObjetivo.Intangible = false;
          jugadorObjetivo.setTint(0xffffff);
          jugadorObjetivo.alpha = 1;
          if (jugadorObjetivo && jugadorObjetivo.body) {
            jugadorObjetivo.body.enable = true;
          }
        });
      }
    };

    // --- Lanzamiento: velocidad y destrucción al llegar ---
    const distancia = Phaser.Math.Distance.Between(ladrillo.x, ladrillo.y, targetX, targetY);
    const velocidadLanzamiento = 2500; // px/s — bajar si querés menos alcance visual
    if (distancia <= 2) {
      ladrillo.setVelocity(0, 0);
      ladrillo.setAngularVelocity(0);
    } else {
      const angulo = Phaser.Math.Angle.Between(ladrillo.x, ladrillo.y, targetX, targetY);
      const vx = Math.cos(angulo) * velocidadLanzamiento;
      const vy = Math.sin(angulo) * velocidadLanzamiento;

      if (ladrillo.body) {
        ladrillo.body.setAllowGravity(false);
        ladrillo.body.setDrag(0, 0);
        ladrillo.body.setMaxVelocity(velocidadLanzamiento * 2, velocidadLanzamiento * 2);
        ladrillo.body.enable = true;
        ladrillo.setVelocity(vx, vy);
      }

      // rotación durante el vuelo (varía entre 300 y 900)
      ladrillo.setAngularVelocity(Phaser.Math.Between(300, 900));

      const tiempoViajeMs = (distancia / velocidadLanzamiento) * 1000;

      // listener por si choca con los límites antes de llegar
      onWorld = (body) => {
        if (body && body.gameObject === ladrillo) {
          destruirLadrilloUnaVez(ladrillo);
        }
      };
      scene.physics.world.on('worldbounds', onWorld);

      // destruir al finalizar el tiempo de vuelo (seguro para cuando no golpea a nadie)
      scene.time.delayedCall(Math.max(50, tiempoViajeMs), () => {
        destruirLadrilloUnaVez(ladrillo);
      });
    }

    const jugadores = [scene.Celeste, scene.Naranja];
    jugadores.forEach(jugador => {
      scene.physics.add.collider(ladrillo, jugador, (l, jugador) => {
        if (l.thrower !== jugador) {
          // --- NUEVO: soltar balde y ladrillos si el jugador es golpeado por un ladrillo ---
          if (scene.Balde.portadorBalde === jugador) {
            scene.Balde.soltarBalde(jugador);
        }
        if (jugador.ladrillos && jugador.ladrillos.length > 0) {
          // Calcular dirección del golpe
          const dx = jugador.x - l.x;
          const dy = jugador.y - l.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const nx = dx / dist;
          const ny = dy / dist;

          // Soltar y desparramar cada ladrillo
          while (jugador.ladrillos.length > 0) {
            const ladrilloSoltado = jugador.ladrillos[jugador.ladrillos.length - 1];
            jugador.ladrillos.pop();
            ladrilloSoltado.portadorLadrillo = null;
            ladrilloSoltado.x = jugador.x + Phaser.Math.Between(-10, 10);
            ladrilloSoltado.y = jugador.y + Phaser.Math.Between(-10, 10);
            ladrilloSoltado.setDepth(1);
            ladrilloSoltado.setRotation(0);

            // Desactivar física durante el tween
            if (ladrilloSoltado.body) {
              ladrilloSoltado.body.enable = false;
            }

            // Calcular destino cercano en la dirección del golpe
            const distancia = Phaser.Math.Between(80, 120);
            const destinoX = jugador.x + nx * distancia + Phaser.Math.Between(-30, 30);
            const destinoY = jugador.y + ny * distancia + Phaser.Math.Between(-30, 30);

            scene.tweens.add({
              targets: ladrilloSoltado,
              x: destinoX,
              y: destinoY,
              angle: Phaser.Math.Between(360, 1080),
              duration: 400,
              ease: 'Cubic.easeOut',
              onComplete: () => {
                // Reactivar física y dejar el ladrillo listo para recoger
                if (ladrilloSoltado.body) {
                  ladrilloSoltado.body.enable = true;
                  ladrilloSoltado.setBounce(0.35);
                  ladrilloSoltado.setAngularVelocity(0); // <--- DETIENE GIRO
                  ladrilloSoltado.setCollideWorldBounds(true);
                  ladrilloSoltado.body.onWorldBounds = true;
                }
                // Hacer interactivo y agregar overlaps para recoger
                ladrilloSoltado.setInteractive();
                scene.physics.add.overlap(scene.Celeste, ladrilloSoltado, () => {
                  const arr = scene.toca.Ladrillo.Celeste;
                  if (!arr.includes(ladrilloSoltado)) arr.push(ladrilloSoltado);
                }, null, scene);
                scene.physics.add.overlap(scene.Naranja, ladrilloSoltado, () => {
                  const arr = scene.toca.Ladrillo.Naranja;
                  if (!arr.includes(ladrilloSoltado)) arr.push(ladrilloSoltado);
                }, null, scene);
              }
            });
          }
          jugador.ManosOcupadas = false;
          jugador.llevaLadrillo = false;
        }
        aplicarNoqueo(jugador, l);
        destruirLadrilloUnaVez(l);
      }
    }, null, scene);
    });

    // cancelar modo apuntado tras lanzar
    this.cancelAiming();
}
}