export default class Material extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);
  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setImmovable(true).setDepth(1);

  // --- HITBOX personalizada según el material ---
  if (texture === "Arena" || texture === "Grava" || texture === "Ladrillos" || texture === "Mezcladora") {
    const fullWidth = this.width * this.scaleX;
    const fullHeight = this.height * this.scaleY;
    this.body.setSize(fullWidth, fullHeight / 2);
    this.body.setOffset(0, fullHeight / 2);

    // --- Caja de colisión interna ---
    this.hitboxInterna = scene.add.rectangle(
      x, // posición centrada en la mitad
      y + 5, // posición centrada en la mitad inferior
      fullWidth * 0.45,    // ancho reducido
      fullHeight * 0.01,  // alto reducido
      0xff0000,
      0 // invisible
    );
    scene.physics.add.existing(this.hitboxInterna, true); // true = estático
  }

  this.portadorBalde = null;
  this.lleno = false;
  this.portadorLadrillo = null;

  // --- NUEVO: contadores para la construcción ---
  if (texture === "Construccion") {
    // Inicializa los requerimientos aleatorios entre 2 y 3
    this.cementoNecesario = Phaser.Math.Between(2, 3);
    this.ladrilloNecesario = Phaser.Math.Between(10, 12);
    this.cementoCount = 0;
    this.ladrilloCount = 0;
  }

  // Si es la mezcladora, agregamos contadores
  if (texture === "Mezcladora") {
    this.arenaCount = 0;
    this.gravaCount = 0;
  }
}

// ---------- BALDE ----------
interactuarBalde(jugador, tecla) {
  // Solo permite levantar si hay overlap y condiciones correctas
  if (
    this.scene.physics.overlap(jugador, this) &&
    !jugador.ManosOcupadas &&
    !jugador.Aturdido &&
    this.portadorBalde === null
  ) {
    this.cargarBalde(jugador);
  } else if (this.portadorBalde === jugador) {
    this.soltarBalde(jugador);
  }
}

cargarBalde(jugador){
    jugador.ManosOcupadas = true;
    jugador.llevaBalde = true;
    this.portadorBalde = jugador;
    console.log(`${jugador.texture.key} levantó el ${this.texture.key}`);
}

soltarBalde(jugador) {
jugador.ManosOcupadas = false;
jugador.llevaBalde = false; 
this.portadorBalde = null;
this.x = jugador.x + 30;
this.y = jugador.y + 30;
this.setDepth(0);
console.log(`${jugador.texture.key} soltó el ${this.texture.key}`);
}

llenarBalde(jugador, tecla, material) {
if (Phaser.Input.Keyboard.JustDown(tecla)) {
  // Solo si el balde está vacío
  if (this.texture.key === "Balde" && !this.lleno) { 
    if (material.texture.key === "Arena") { //Llena el balde de Arena
      this.setTexture("BaldeArena");
      this.scene.sound.play("Arena", {rate: 3});
      this.lleno = true;
      console.log(`${jugador.texture.key} llenó el balde con arena`);
    } else if (material.texture.key === "Grava") { //Llena el balde de Grava
      this.setTexture("BaldeGrava");
      this.scene.sound.play("RecGrava", {volume: 3});
      this.lleno = true;
      console.log(`${jugador.texture.key} llenó el balde con grava`);
    } else if (material.texture.key === "Cemento") { //Llena el balde de Cemento
      // --- NUEVO: solo si hay usos restantes ---
      if (material.usosRestantes > 0) {
        this.setTexture("BaldeCemento");
        this.lleno = true;
        material.usosRestantes--;
        console.log(`${jugador.texture.key} llenó el balde con cemento. Usos restantes: ${material.usosRestantes}`);
        if (material.usosRestantes <= 0) {
          material.destroy();
          this.scene.Mezcladora.setTexture("Mezcladora");
          this.scene.Cemento = null;
          console.log("El cemento se ha agotado y desaparece.");
        }
      } else {
        console.log("¡No queda más cemento!");
      }
    }
  }
}
}

vaciarBalde = () => {
  this.scene.Balde.setTexture("Balde");
  this.scene.Balde.lleno = false;
}

// ---------- LADRILLOS ----------
interactuarLadrillos(jugador) {
  if (
    this.scene.physics.overlap(jugador, this) &&
    !jugador.ManosOcupadas &&
    !jugador.Aturdido &&
    this.portadorLadrillo === null
  ) {
    this.levantarLadrillo(jugador);
    console.log(`${jugador.texture.key} levantó ladrillos`);
  } else if (this.portadorLadrillo === jugador) {
    this.soltarLadrillo(jugador);
    console.log(`${jugador.texture.key} soltó el ladrillo`);
  }
}

levantarLadrillo(jugador) {
  if (jugador.ladrillos.length === 0 && !jugador.Aturdido) {
    jugador.ManosOcupadas = true;
    jugador.llevaLadrillo = true;

    // Crear 3 ladrillos y agregarlos al jugador
    for (let i = 0; i < 3; i++) {
      const offsetY = 25 - (i * 18); // Ajustar la posición de cada ladrillo
      const ladrillo = new Material(
        this.scene,
        jugador.x + 20,
        jugador.y + offsetY,
        "Ladrillo"
      ).setScale(0.5).setDepth(1);
      ladrillo.portadorLadrillo = jugador;
      jugador.ladrillos.push(ladrillo);
    }

    // --- NUEVO: Reposicionar todos los ladrillos que lleva el jugador ---
    jugador.ladrillos.forEach((lad, i) => {
      lad.setDepth(jugador.depth + 1 + i);
      lad.x = jugador.x + 20;
      lad.y = jugador.y + 25 - (i * 18);
    });

    console.log(`${jugador.texture.key} levantó 3 ladrillos`);
  }
}

soltarLadrillo(jugador) {
  if (jugador.ladrillos.length > 0) {
    const ladrillo = jugador.ladrillos.pop();
    ladrillo.portadorLadrillo = null;
    ladrillo.x = jugador.x + 40;
    ladrillo.y = jugador.y + 50;
    ladrillo.setDepth(0);
    ladrillo.setInteractive();
    ladrillo.body.enable = true;
    this.scene.physics.add.collider(ladrillo, this.scene.barreras); // <-- NUEVO

    // Overlap para recoger
    this.scene.physics.add.overlap(this.scene.Celeste, ladrillo, () => {
      const arr = this.scene.toca.Ladrillo.Celeste;
      if (!arr.includes(ladrillo)) arr.push(ladrillo);
    }, null, this);
    this.scene.physics.add.overlap(this.scene.Naranja, ladrillo, () => {
      const arr = this.scene.toca.Ladrillo.Naranja;
      if (!arr.includes(ladrillo)) arr.push(ladrillo);
    }, null, this);

    console.log(`${jugador.texture.key} soltó un ladrillo (${jugador.ladrillos.length}/3)`);
    if (jugador.ladrillos.length === 0) {
      jugador.ManosOcupadas = false;
      jugador.llevaLadrillo = false;
    }
  }
}

levantarLadrilloSuelo(jugador, ladrillo) {
  if (
    jugador.ladrillos.length < 3 &&
    !jugador.Aturdido &&
    ladrillo.portadorLadrillo === null
  ) {
    ladrillo.portadorLadrillo = jugador;
    jugador.ladrillos.push(ladrillo);
    jugador.ManosOcupadas = true;
    jugador.llevaLadrillo = true;
    ladrillo.body.enable = false;
    // Quitar el ladrillo del array de tocados
    const arr = this.scene.toca.Ladrillo[jugador.texture.key];
    const idx = arr.indexOf(ladrillo);
    if (idx !== -1) arr.splice(idx, 1);

    // --- NUEVO: Reposicionar todos los ladrillos que lleva el jugador ---
    jugador.ladrillos.forEach((lad, i) => {
      lad.setDepth(jugador.depth + 1 + i);
      lad.x = jugador.x + 20;
      lad.y = jugador.y + 25 - (i * 18);
    });

    console.log(`${jugador.texture.key} levantó un ladrillo del suelo (${jugador.ladrillos.length}/3)`);
  }
}

// ---------- MEZCLADORA ----------
cargarMaquina(jugador, tecla, material){
  if (Phaser.Input.Keyboard.JustDown(tecla)){
    if (this.texture.key === "Mezcladora") {
    if (material.texture.key === "Arena" && this.arenaCount < 2) {
      this.arenaCount++;
    } else if (material.texture.key === "Grava" && this.gravaCount < 1) {
      this.gravaCount++;
    }

    if (!(this.arenaCount === 2 && this.gravaCount === 1)) {
    this.setTint(0xffff00);

    //Volver color a la normalidad
    this.scene.time.delayedCall(500, () => {
   this.setTint(0xffffff);
    });
    }

    // Vaciar balde siempre
    this.vaciarBalde();

    console.log(
      `${jugador.texture.key} cargó la mezcladora con ${material.texture.key}. Arena: ${this.arenaCount}/2, Grava: ${this.gravaCount}/1`
    );

    // Chequear si ya tiene la receta completa
    if (this.arenaCount === 2 && this.gravaCount === 1) { // Cantidad de baldes por material
      this.funcionar();
    }
  }
  }
}

funcionar(){
console.log("✅ ¡La mezcladora está funcionando!");
this.setTint(0x00ff00);

this.scene.time.delayedCall(3000, () => {
  this.arenaCount = 0;
  this.gravaCount = 0;
  this.setTint(0xffffff);
  this.setTexture("MezcladoraLlena");
  if (this.Cemento) {
    this.Cemento.destroy(); // Destruir el cemento viejo si existe
  }
  
  // Crear el cemento y guardar la referencia
  const Cemento = new Material(this.scene, this.x - 5, this.y + 150, "Cemento").setScale(0.5);
  Cemento.usosRestantes = 3; // <-- NUEVO: contador de usos
  this.scene.Cemento = Cemento;
  console.log("Se generó un balde de cemento");
  console.log("La mezcladora está lista para otro uso");
});
}

// ---------- CONSTRUCCION ----------

recibirCemento(jugador) {
  if (
    this.texture.key === "Construccion" || this.texture.key === "Construccion2" || this.texture.key === "Construccion3" &&
    jugador.llevaBalde &&
    this.scene.Balde.lleno &&
    ["BaldeCemento"].includes(this.scene.Balde.texture.key)
  ) {
    if (this.cementoCount < this.cementoNecesario) {
      this.cementoCount++;
      if (this.scene.actualizarTextoConstruccion) this.scene.actualizarTextoConstruccion();
      this.scene.Balde.vaciarBalde();

      if (!(this.cementoCount >= this.cementoNecesario && this.ladrilloCount >= this.ladrilloNecesario)) {
        this.setTint(0xcccccc);
        this.scene.time.delayedCall(300, () => this.setTint(0xffffff));
      }
      this.verificarConstruccion();
    }
  }
}

recibirLadrillo(jugador) {
  if (this.texture.key === "Construccion" || this.texture.key === "Construccion2" || this.texture.key === "Construccion3" && jugador.ladrillos.length > 0) {
    if (this.ladrilloCount < this.ladrilloNecesario) {
      const ladrillo = jugador.ladrillos.pop();
      if (ladrillo) {
        this.ladrilloCount++;
        if (this.scene.actualizarTextoConstruccion) this.scene.actualizarTextoConstruccion();
        ladrillo.destroy();
        if (!(this.cementoCount >= this.cementoNecesario && this.ladrilloCount >= this.ladrilloNecesario)) {
          this.setTint(0xffcc99);
          this.scene.time.delayedCall(300, () => this.setTint(0xffffff));
        }
        this.verificarConstruccion();
        if (jugador.ladrillos.length === 0) {
          jugador.ManosOcupadas = false;
          jugador.llevaLadrillo = false;
        }
      }
    }
  }
}

etapa1Construccion() {
  // Parpadeo entre texturas y transición a Construccion2
  const parpadeos = 2;
  const intervalo = 120;
  for (let i = 0; i < parpadeos * 2; i++) {
    this.scene.time.delayedCall(i * intervalo, () => {
      if (i % 2 === 0) {
        this.setTexture("Construccion2");
      } else {
        this.setTexture("Construccion");
      }
    });
  }
  this.scene.time.delayedCall(parpadeos * 2 * intervalo, () => {
    this.setTexture("Construccion2");
    this.setDepth(this.depth + 2);
    this.scene.sound.play("SonidoConstruccion", {volume: 0.75, rate: 2});
    console.log(" ¡Primera Construcción completada!");
    // --- SUMAR 3 MINUTOS ---
    if (this.scene.sumarTiempo) this.scene.sumarTiempo(180);
  });
}

etapa2Construccion() {
  // Ajustar hitbox al nuevo sprite
  const fullWidth = this.width * this.scaleX;
  const fullHeight = this.height * this.scaleY;
  this.body.setSize(fullWidth, fullHeight - 38);
  this.body.setOffset(0, fullHeight - 326);

  const paredizq = this.scene.add.image(this.x - 140, this.y + 155, "Pared").setScale(1).setDepth(2);
  const paredder = this.scene.add.image(this.x + 140, this.y + 155, "Pared").setScale(1).setDepth(2);

  // --- Crear hitbox superior interna para Celeste ---
  if (!this.hitboxInternaCeleste) {
    this.hitboxInternaSupCeleste = this.scene.add.zone(
      this.x,
      this.y - 200,
      fullWidth * 0.9,
      fullHeight * 0.01
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxInternaSupCeleste);
    this.hitboxInternaSupCeleste.body.setAllowGravity(false);
    this.hitboxInternaSupCeleste.body.setImmovable(true);
    this.hitboxInternaSupCeleste.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Celeste, this.hitboxInternaSupCeleste);
  }

  // --- Crear hitbox izq inf interna para Celeste ---
  if (!this.hitboxInfIzqCeleste) {
    this.hitboxInfIzqCeleste = this.scene.add.zone(
      this.x - 140,
      this.y + 150,
      fullWidth * 0.35,
      fullHeight * 0.01
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxInfIzqCeleste);
    this.hitboxInfIzqCeleste.body.setAllowGravity(false);
    this.hitboxInfIzqCeleste.body.setImmovable(true);
    this.hitboxInfIzqCeleste.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Celeste, this.hitboxInfIzqCeleste);
  }

  // --- Crear hitbox der inf interna para Celeste ---
  if (!this.hitboxInfDerCeleste) {
    this.hitboxInfDerCeleste = this.scene.add.zone(
      this.x + 140,
      this.y + 150,
      fullWidth * 0.35,
      fullHeight * 0.01
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxInfDerCeleste);
    this.hitboxInfDerCeleste.body.setAllowGravity(false);
    this.hitboxInfDerCeleste.body.setImmovable(true);
    this.hitboxInfDerCeleste.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Celeste, this.hitboxInfDerCeleste);
  }

  // --- Crear hitbox interna para Naranja ---
  if (!this.hitboxInternaSupNaranja) {
    this.hitboxInternaSupNaranja = this.scene.add.zone(
      this.x,
      this.y - 200,
      fullWidth * 0.9,
      fullHeight * 0.01
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxInternaSupNaranja);
    this.hitboxInternaSupNaranja.body.setAllowGravity(false);
    this.hitboxInternaSupNaranja.body.setImmovable(true);
    this.hitboxInternaSupNaranja.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Naranja, this.hitboxInternaSupNaranja);
  }

  // --- Crear hitbox izq inf interna para Naranja ---
  if (!this.hitboxInfIzqNaranja) {
    this.hitboxInfIzqNaranja = this.scene.add.zone(
      this.x - 140,
      this.y + 150,
      fullWidth * 0.35,
      fullHeight * 0.01
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxInfIzqNaranja);
    this.hitboxInfIzqNaranja.body.setAllowGravity(false);
    this.hitboxInfIzqNaranja.body.setImmovable(true);
    this.hitboxInfIzqNaranja.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Naranja, this.hitboxInfIzqNaranja);
  }

  // --- Crear hitbox der inf interna para Naranja ---
  if (!this.hitboxInfDerNaranja) {
    this.hitboxInfDerNaranja = this.scene.add.zone(
      this.x + 140,
      this.y + 150,
      fullWidth * 0.35,
      fullHeight * 0.01
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxInfDerNaranja);
    this.hitboxInfDerNaranja.body.setAllowGravity(false);
    this.hitboxInfDerNaranja.body.setImmovable(true);
    this.hitboxInfDerNaranja.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Naranja, this.hitboxInfDerNaranja);
  }

  // --- NUEVO: Crear hitbox laterales fijas ---
  if (!this.hitboxLateralIzq) {
    this.hitboxLateralIzq = this.scene.add.zone(
      this.x - fullWidth / 2 + 10, // posición lateral izquierda
      this.y - 25,
      20, // ancho de la hitbox lateral
      fullHeight * 0.8 // alto de la hitbox lateral
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxLateralIzq);
    this.hitboxLateralIzq.body.setAllowGravity(false);
    this.hitboxLateralIzq.body.setImmovable(true);
    this.hitboxLateralIzq.setDepth(this.depth + 1);
    // Puedes agregar colisión con ambos jugadores si lo necesitas:
    this.scene.physics.add.collider(this.scene.Celeste, this.hitboxLateralIzq);
    this.scene.physics.add.collider(this.scene.Naranja, this.hitboxLateralIzq);
  }

  if (!this.hitboxLateralDer) {
    this.hitboxLateralDer = this.scene.add.zone(
      this.x + fullWidth / 2 - 10, // posición lateral derecha
      this.y - 25,
      20, // ancho de la hitbox lateral
      fullHeight * 0.8 // alto de la hitbox lateral
    ).setOrigin(0.5);
    this.scene.physics.add.existing(this.hitboxLateralDer);
    this.hitboxLateralDer.body.setAllowGravity(false);
    this.hitboxLateralDer.body.setImmovable(true);
    this.hitboxLateralDer.setDepth(this.depth + 1);
    this.scene.physics.add.collider(this.scene.Celeste, this.hitboxLateralDer);
    this.scene.physics.add.collider(this.scene.Naranja, this.hitboxLateralDer);
  }

  // Cambio de textura y sonido
  this.y -= 50;
  this.setDepth(1.5);
  this.setTexture("Construccion3");
  this.scene.sound.play("SonidoConstruccion", {volume: 0.75, rate: 2});
  console.log(" ¡Segunda Construcción completada!");
  // --- SUMAR 5 MINUTOS ---
  if (this.scene.sumarTiempo) this.scene.sumarTiempo(300);
}

verificarConstruccion() {
  if (this.cementoCount >= this.cementoNecesario && this.ladrilloCount >= this.ladrilloNecesario) {
    if (this.texture.key === "Construccion") {
      this.etapa1Construccion();
    } else if (this.texture.key === "Construccion2") {
      this.etapa2Construccion();
    }

    // Aumenta los requerimientos para la próxima vez (entre 1 y 2)
    this.cementoNecesario += Phaser.Math.Between(1, 2);
    this.ladrilloNecesario += Phaser.Math.Between(3, 4);

    // Reinicia los contadores
    this.cementoCount = 0;
    this.ladrilloCount = 0;

    if (this.scene.actualizarTextoConstruccion) this.scene.actualizarTextoConstruccion();
  }
}

update() {
  // seguridad: si no hay scene, salir
  if (!this.scene) return;

  // Si alguien lo lleva, seguir al portador
  if (this.portadorBalde) {
    this.x = this.portadorBalde.x + 20;
    this.y = this.portadorBalde.y + 50;
    this.setDepth(this.portadorBalde.depth + 1);
  } else if (this.portadorLadrillo) {
    const idx = this.portadorLadrillo.ladrillos.indexOf(this);
    this.x = this.portadorLadrillo.x;
    this.y = this.portadorLadrillo.y + 25 - (idx * 18);
    this.setDepth(this.portadorLadrillo.depth + 0.1 * (idx + 1));
  }

  // --- NUEVO: depth dinámico según posición Y del jugador ---
  // Solo para materiales que no están siendo llevados y NO sean "Construccion"
  if ((this.texture.key !== "Construccion" && this.texture.key !== "Construccion2" && this.texture.key !== "Construccion3" && !this.portadorBalde && !this.portadorLadrillo)) {
    const jugadores = [this.scene.Celeste, this.scene.Naranja];
    let depthBase = 1;
    for (const jugador of jugadores) {
      if (
        jugador &&
        Math.abs(jugador.x - this.x) < this.width * this.scaleX && // cerca en X
        jugador.y < this.y + 50 // jugador está por arriba del material
      ) {
        this.setDepth(jugador.depth + 1);
        depthBase = null;
        break;
      }
    }
    if (depthBase !== null) {
      this.setDepth(1); // profundidad normal si ningún jugador está arriba
    }
  }

  // --- NUEVO: depth dinámico para jugadores según posición Y respecto a la construcción ---
  if (this.texture.key === "Construccion3") {
    const jugadores = [this.scene.Celeste, this.scene.Naranja];
    for (const jugador of jugadores) {
      if (
        jugador &&
        Math.abs(jugador.x - this.x) < this.width * this.scaleX // cerca en X
      ) {
        // Si el jugador está por debajo del límite Y de la construcción
        if (jugador.y < this.y - 205) {
          jugador.setDepth(this.depth - 1);
        } else {
          jugador.setDepth(this.depth + 1);
        }
      }
    }
  }

  // --- NUEVO: depth dinámico para jugadores según posición Y respecto a la pared ---
  if (this.texture.key === "Pared") {
    const jugadores = [this.scene.Celeste, this.scene.Naranja];
    for (const jugador of jugadores) {
      if (
        jugador &&
        Math.abs(jugador.x - this.x) < this.width * this.scaleX // cerca en X
      ) {
        // Si el jugador está por debajo del límite Y de la pared
        if (jugador.y > this.y) {
          jugador.setDepth(1.5);
        } else {
          jugador.setDepth(2);
        }
      }
    }
  }

  // --- NUEVO: destruir ladrillo si sale del mapa ---
  // Usar valores seguros: primero properties de scene (anchoMapa/altoMapa), si no existen usar dimensiones de la cámara
  const anchoMapa = (this.scene && typeof this.scene.anchoMapa === 'number')
    ? this.scene.anchoMapa
    : (this.scene && this.scene.cameras && this.scene.cameras.main ? this.scene.cameras.main.width : Number.POSITIVE_INFINITY);

  const altoMapa = (this.scene && typeof this.scene.altoMapa === 'number')
    ? this.scene.altoMapa
    : (this.scene && this.scene.cameras && this.scene.cameras.main ? this.scene.cameras.main.height : Number.POSITIVE_INFINITY);

  if (
    this.texture.key === "Ladrillo" &&
    (
      this.x < 0 ||
      this.x > anchoMapa ||
      this.y < 0 ||
      this.y > altoMapa
    )
  ) {
    this.destroy();
    console.log("Un ladrillo salió del mapa y fue destruido.");
  }

  if (this.texture.key === "Construccion3") {
    const celesteTocando = this.scene.physics.overlap(this.scene.Celeste, this);
    const naranjaTocando = this.scene.physics.overlap(this.scene.Naranja, this);

    // Si uno está tocando y el otro no, desactiva el collider
    if (celesteTocando !== naranjaTocando) {
      if (this.scene.colliderJugadores) {
        this.scene.colliderJugadores.active = false;
      }
    } else {
      // Si ambos están tocando o ambos no, activa el collider
      if (this.scene.colliderJugadores && !this.scene.colliderJugadores.active) {
        this.scene.colliderJugadores.active = true;
      }
    }
  }
}
}