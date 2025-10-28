import Jugador from "./Jugador.js";

export default class JugadorCeleste extends Jugador {
  constructor(scene, x, y, texture = "Celeste") {
    super(scene, x, y, texture);
  }

  // Mismo movimiento pero SIN cambiar texturas (es Celeste)
  Mover(teclas, correrKey) {
    const scene = this.scene;
    const base = this.velocidadBase;
    let speed = base;

    if (this.llevaBalde && scene.Balde && scene.Balde.lleno) {
      speed = 150;
    } else if (this.ladrillos && this.ladrillos.length > 0) {
      speed = this.velocidadBase - 45 * this.ladrillos.length;
      if (speed < 60) speed = 60;
    }

    if (this.aiming) {
      if (!this.aimCursor || !this.aimCursor.scene) {
        const texturaMira = (this.texture && this.texture.key === "Celeste") ? "MiraCeleste" : "MiraNaranja";
        this.aimCursor = scene.add.image(this.x + 80, this.y, texturaMira)
          .setScale(0.25)
          .setDepth(6)
          .setAlpha(0.95);
      }

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

      this.setVelocity(0, 0);
      return;
    }

    if (!this.Aturdido) {
      let velX = 0, velY = 0;

      if (teclas.izq.isDown) {
        velX = -speed;
        this.setFlipX(true);
      } else if (teclas.der.isDown) {
        velX = speed;
        this.setFlipX(false);
      }

      if (teclas.arriba.isDown) {
        velY = -speed;
      } else if (teclas.abajo.isDown) {
        velY = speed;
      }

      // Determinar si está corriendo antes de aplicar multiplicador
      const movingBeforeRun = (velX !== 0 || velY !== 0);
      const isRunning = correrKey && correrKey.isDown && movingBeforeRun;
      if (isRunning) {
        velX *= 1.5;
        velY *= 1.5;
      }

      this.setVelocityX(velX);
      this.setVelocityY(velY);

      const moving = (velX !== 0 || velY !== 0);
      const ladrillosCount = (this.ladrillos && this.ladrillos.length) ? this.ladrillos.length : 0;

      // Si tiene ladrillos (>=1) o lleva balde: NO reproducir animación y mostrar textura original.
      if (ladrillosCount > 0 || this.llevaBalde) {
        if (this.anims.isPlaying) this.anims.stop();
        this.setTexture("Celeste");

        // Balanceo (rotar ±20°) cuando se mueve:
        if (moving) {
          if (!this._balanceTween) {
            // comenzar desde -10 para que oscile -20 -> 20 -> -20 ...
            this.angle = -10;
            this._balanceTween = scene.tweens.add({
              targets: this,
              angle: 10,
              duration: 400,
              ease: 'Sine.easeInOut',
              yoyo: true,
              repeat: -1
            });
          } else {
            // si existe pero está pausado, reanudar
            if (this._balanceTween.paused) this._balanceTween.resume();
          }
        } else {
          // dejar de moverse: detener tween y volver a ángulo 0
          if (this._balanceTween) {
            this._balanceTween.stop();
            this._balanceTween.remove();
            this._balanceTween = null;
          }
          this.angle = 0;
        }

        return; // no ejecutar animaciones normales
      }

      // Si no lleva ladrillos ni balde, asegurar que cualquier tween de balanceo esté removido
      if (this._balanceTween) {
        this._balanceTween.stop();
        this._balanceTween.remove();
        this._balanceTween = null;
        this.angle = 0;
      }

      // Animaciones normales: correr > caminar > idle
      const animKey = moving ? (isRunning ? "CorrerCeleste" : "CaminarCeleste") : null;

      if (animKey) {
        const currentKey = this.anims.currentAnim ? this.anims.currentAnim.key : null;
        if (currentKey !== animKey || !this.anims.isPlaying) {
          this.anims.play(animKey, true);
        }
      } else {
        if (this.anims.isPlaying) this.anims.stop();
        this.setTexture("Celeste");
      }
    } else {
      this.setVelocity(0);
    }
  }
}