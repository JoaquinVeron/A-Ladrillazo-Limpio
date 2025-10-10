export default class Material extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);
  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setImmovable(true);

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
  const Cemento = new Material(this.scene, this.x + 150, this.y, "Cemento").setScale(0.5);
  Cemento.usosRestantes = 3; // <-- NUEVO: contador de usos
  this.scene.Cemento = Cemento;
  console.log("Se generó un balde de cemento");
  console.log("La mezcladora está lista para otro uso");
});
}

// ---------- CONSTRUCCION ----------

recibirCemento(jugador) {
  if (
    this.texture.key === "Construccion" &&
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
  if (this.texture.key === "Construccion" && jugador.ladrillos.length > 0) {
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

// --- NUEVO: verifica si se cumple la condición para cambiar de color ---
verificarConstruccion() {
  if (this.cementoCount >= this.cementoNecesario && this.ladrilloCount >= this.ladrilloNecesario) {
    this.setTint(0x00ff00);
    this.scene.sound.play("SonidoConstruccion", {volume: 0.75, rate: 2});
    console.log("¡Construcción completada!");

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
    this.setDepth(this.portadorLadrillo.depth + 1 + idx);
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
}
}