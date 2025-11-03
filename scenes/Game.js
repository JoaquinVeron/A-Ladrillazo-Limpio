import JugadorCeleste from "../clases/JugadorCeleste.js";
import JugadorNaranja from "../clases/JugadorNaranja.js";
import Vehiculo from "../clases/Vehiculo.js";
import Material from "../clases/Material.js";

export default class Game extends Phaser.Scene {
constructor() {
  super("game");
}

create() {
// Lanzar HUD
  this.scene.launch('HUD', { sceneKey: this.scene.key });
  
  this.gameOver = false;
  this.winCondition = false;

// ----------- CÁMARA ----------

  // Centro de la cámara
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;

  // Teclas para interactuar
  this.eKey = this.input.keyboard.addKey('E');
  this.fKey = this.input.keyboard.addKey('F');
  this.jKey = this.input.keyboard.addKey('J');
  this.kKey = this.input.keyboard.addKey('K');
  this.lKey = this.input.keyboard.addKey('L');
  
  // Inicializa los cursores
  this.cursors = this.input.keyboard.createCursorKeys();

  // Limita la cámara a los bordes del mapa
  const margenX = 0; // margen horizontal
  const margenY = 0; // margen vertical
  const anchoMapa = this.cameras.main.width;
  const altoMapa = this.cameras.main.height;
  this.anchoMapa = anchoMapa;
  this.altoMapa = altoMapa;
  this.cameras.main.setBounds(margenX, margenY, anchoMapa - margenX * 2, altoMapa - margenY * 2);

  // ----------- DETALLES ----------

  // Sombreado
  //this.add.image(centerX, centerY, "Sombreado").setDepth(4).setAlpha(0.5);

  // Pasto de fondo
  this.pasto = this.add.image(centerX, centerY, "Pasto")
  .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
  .setDepth(1);

  // Pasto detalle
  this.add.image(centerX, centerY, "PastoDetalle")
  .setOrigin(0.5)
  .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
  .setAlpha(1)
  .setDepth(2);

  // ----------- CALLES ----------
  
  //Grupo de calles
  this.Calles = this.physics.add.group();
  this.CalleIZQ = this.add.image(centerX - 210, centerY, "Calle").setOrigin(0.5).setDepth(1);
  this.CalleDER = this.add.image(centerX + 210, centerY, "Calle").setOrigin(0.5).setDepth(1);

  const CalleIZQCenter = this.CalleIZQ.x;
  const CalleDERCenter = this.CalleDER.x;

  // ----------- BARRERAS ----------

  // Calcula las posiciones Y de las barreras (simétricas respecto a centerY)
  const cantidadPosiciones = 5;
  const separacion = 216; 
  const posicionesBarrerasY = [];
  const offset = Math.floor(cantidadPosiciones / 2);

  for (let i = 0; i < cantidadPosiciones; i++) { // 5 posiciones
    posicionesBarrerasY.push(centerY + (i - offset) * separacion);
  }

  // Elige aleatoriamente si serán 2 o 3 barreras
  const cantidadElegida = Phaser.Math.Between(2, 3);

  // Selecciona posiciones aleatorias únicas
  const posicionesElegidas = Phaser.Utils.Array.Shuffle(posicionesBarrerasY).slice(0, cantidadElegida);

  // Crea las barreras en las posiciones elegidas
  this.barreras = [];
  for (const y of posicionesElegidas) {
    const barrera = this.physics.add.sprite(centerX, y, "Barrera").setImmovable(true).setDepth(3);
    this.barreras.push(barrera);
  }

  // ---------- JUGADORES ----------
  
  this.Celeste = new JugadorCeleste(this, centerX - 675, centerY + 325, "Celeste");
  this.Naranja = new JugadorNaranja(this, centerX - 500, centerY + 325, "Naranja");

  // Grupo de jugadores
  this.jugadores = this.physics.add.group();
  this.jugadores.add(this.Celeste);
  this.jugadores.add(this.Naranja);
  this.Celeste.setCollideWorldBounds(true);
  this.Naranja.setCollideWorldBounds(true);
  this.jugadores.Intangible = false;
  this.jugadores.Aturdido = false;
  this.jugadores.ManosOcupadas = false;
  this.jugadores.setDepth(5);

  // Colisión entre jugadores
  this.colliderJugadores = this.physics.add.collider(this.Celeste, this.Naranja);

  // Colisión entre jugadores y barreras
  this.physics.add.collider(this.jugadores, this.barreras);

  // Calcular el punto medio entre ambos jugadores
  const medioX = (this.Celeste.x + this.Naranja.x) / 2;
  const medioY = (this.Celeste.y + this.Naranja.y) / 2;

  // ---------- VEHICULOS ----------
  this.autos = this.physics.add.group({ runChildUpdate: true });
  this.motos = this.physics.add.group({ runChildUpdate: true });

  // crear spawners delegando a Vehiculo
  Vehiculo.createAutoSpawner({
    scene: this,
    group: this.autos,
    centerX,
    centerY,
    CalleIZQCenter,
    CalleDERCenter
  });

  Vehiculo.createMotoSpawner({
    scene: this,
    group: this.motos,
    centerY,
    CalleIZQCenter,
    CalleDERCenter
  });

// ---------- SONIDO DE FONDO ----------
// Array de sonidos
this.sonidosCarretera = ["SonidoCarretera", "SonidoCarretera2"];

// Función para reproducir uno aleatorio despues de 2 segundos
this.reproducirCarretera = () => {
  this.time.delayedCall(1000, () => {
    const sonidoElegido = Phaser.Utils.Array.GetRandom(this.sonidosCarretera);

  // Reproducir el sonido elegido
  const sound = this.sound.add(sonidoElegido);

  sound.once("complete", () => {
    // Cuando termina, reproducir otro (aleatorio de nuevo)
    this.reproducirCarretera();
  });
  
  if (sonidoElegido === "SonidoCarretera") {
    sound.play({ volume: 0.01, rate: 1, detune: 100 });
  }
  else if (sonidoElegido === "SonidoCarretera2") {
    sound.play({ volume: 0.05, rate: 1, detune: 100 });
  }
  });
}

// Iniciar el loop aleatorio
this.reproducirCarretera();

  // ---------- MATERIALES ----------
  this.Arena = new Material(this, centerX + 700, centerY - 300, "Arena").setScale(0.5);
  this.Balde = new Material(this, medioX, medioY, "Balde").setScale(0.5).setDepth(4);
  this.Construccion = new Material(this, centerX - 650, centerY, "Construccion").setDepth(0).setScale(1);
  this.Grava = new Material(this, centerX + 700, centerY + 300, "Grava").setScale(0.5);
  this.Ladrillos = new Material(this, centerX + 700, centerY, "Ladrillos").setScale(0.5);
  this.Mezcladora = new Material(this, centerX - 800, medioY - 10, "Mezcladora").setScale(0.5);

  // --- NUEVO: array con todos los materiales excepto Construccion ---
  this.materiales = [
    this.Arena,
    this.Balde,
    this.Grava,
    this.Ladrillos,
    this.Mezcladora,
    this.Construccion
  ];

  // FLAGS DE COLISIONES (para manejar interacciones)
  this.toca = {
  Ladrillo: { Celeste: [], Naranja: [] }, 
};

  // ---------- VEHÍCULOS ----------
  Vehiculo.registerColliders({
    scene: this,
    autosGroup: this.autos,
    motosGroup: this.motos,
    jugadoresGroup: this.jugadores,
    balde: this.Balde
  });
}

spawnVehicle(group, x, y, key, opts = {}) {
const veh = new Vehiculo(this, x, y, key);
group.add(veh);
veh.configure(opts);
return veh;
}

sumarTiempo(segundos) {
  // Delegar al HUD si está disponible
  const hud = this.scene.get('HUD');
  if (hud && typeof hud.sumarTiempo === 'function') {
    hud.sumarTiempo(segundos);
  } else {
    // si HUD aún no está listo, almacenar pendiente para que HUD lo consuma en create()
    this._pendingAddTiempo = (this._pendingAddTiempo || 0) + segundos;
  }
}

update() {

  // --- DETENER TODO EN GAME OVER ---
  if (this.gameOver) {
    
    // Detener todos los audios una única vez
      if (!this._audioStoppedOnGameOver) {
        try { this.sound.stopAll(); } catch (e) { console.warn("stopAll sound failed:", e); }
        this._audioStoppedOnGameOver = true;
      }

    // Detener jugadores
    this.Celeste.setVelocity(0, 0);
    this.Naranja.setVelocity(0, 0);

    // Detener autos y motos
    this.autos.getChildren().forEach(auto => auto.setVelocity(0, 0));
    this.motos.getChildren().forEach(moto => moto.setVelocity(0, 0));

    // Opcional: detener materiales si tienen movimiento
    this.materiales.forEach(material => {
      if (material.body) material.body.setVelocity(0, 0);
    });

    if (this.colliderJugadores) this.colliderJugadores.active = false;
  this.physics.world.colliders.getActive().forEach(collider => {
    collider.active = false;
  });

    return; // No ejecutar más lógica de update
  }

  // TECLAS CELESTE
  const teclasCeleste = {
    izq: this.input.keyboard.addKey('A') || this.inputSystem.isPressed(INPUT_ACTIONS.LEFT, "player1"),
    der: this.input.keyboard.addKey('D') || this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, "player1"),
    arriba: this.input.keyboard.addKey('W') || this.inputSystem.isPressed(INPUT_ACTIONS.UP, "player1"),
    abajo: this.input.keyboard.addKey('S') || this.inputSystem.isPressed(INPUT_ACTIONS.DOWN, "player1")
  };
  const correrCeleste = this.input.keyboard.addKey('SHIFT') || this.inputSystem.isPressed(INPUT_ACTIONS.SOUTH, "player1");

  // TECLAS NARANJA
  const teclasNaranja = {
    izq: this.cursors.left,
    der: this.cursors.right,
    arriba: this.cursors.up,
    abajo: this.cursors.down
  };
  const correrNaranja = this.lKey;

  this.Celeste.Mover(teclasCeleste, correrCeleste);
  this.Naranja.Mover(teclasNaranja, correrNaranja);

  // ---------- INTERACCIONES ----------
  // Interacción con E / gamepad EAST (player1) y J / gamepad EAST (player2)
  this.Celeste.interactuar(this.eKey);
  this.Naranja.interactuar(this.jKey);

  // ---------- INTERACCION CON MATERIALES ----------
  this.Celeste.interactuarMaterial(this.fKey, this.Arena);
  this.Naranja.interactuarMaterial(this.kKey, this.Arena);
  this.Celeste.interactuarMaterial(this.fKey, this.Grava);
  this.Naranja.interactuarMaterial(this.kKey, this.Grava);
  this.Celeste.interactuarMaterial(this.fKey, this.Cemento);
  this.Naranja.interactuarMaterial(this.kKey, this.Cemento);

  // ---------- INTERACCION CON LA MEZCLADORA ----------
  this.Celeste.interactuarMezcladora(this.fKey);
  this.Naranja.interactuarMezcladora(this.kKey);

  // LANZAR LADRILLOS
  this.Celeste.interactuarLadrillo(this.fKey);
  this.Naranja.interactuarLadrillo(this.kKey);

  // ---------- INTERACCION CON LA CONSTRUCCION ----------
  this.Celeste.interactuarConstruccion(this.fKey);
  this.Naranja.interactuarConstruccion(this.kKey);



// --- NUEVO BLOQUE PARA VACIAR BALDE MANTENIENDO BOTON 2 ---
[this.Celeste, this.Naranja].forEach(jugador => {
  if (
    jugador.llevaBalde &&
    this.Balde.lleno &&
    this.Balde.texture.key !== "Balde"
  ) {
    // Elige la tecla correcta
    const key = jugador === this.Celeste ? this.fKey : this.kKey;

    // Si la tecla está presionada y no hay temporizador, inicia el temporizador
    if (key.isDown) {
      if (!jugador.vaciarTimer) {
        jugador.vaciarTimer = this.time.delayedCall(1000, () => {
          this.Balde.vaciarBalde();
          jugador.vaciarTimer = null;
        });
      }
    } else {
      // Si suelta la tecla antes del segundo, cancela el temporizador
      if (jugador.vaciarTimer) {
        jugador.vaciarTimer.remove();
        jugador.vaciarTimer = null;
      }
    }
  } else {
    // Si el balde está vacío o el jugador no lo lleva, cancela el temporizador
    if (jugador.vaciarTimer) {
      jugador.vaciarTimer.remove();
      jugador.vaciarTimer = null;
    }
  }
});

// ---------- ACTUALIZACIONES ----------

if (this.Construccion.texture.key !== "Construccion") {
  this.pasto.setTexture("Pasto2");
} else {
  this.pasto.setTexture("Pasto");
}

  // Actualizar posición del balde si alguien lo lleva
  this.Balde.update();

   // Actualizar posición del ladrillo individual si algún jugador lo lleva
  [this.Celeste, this.Naranja].forEach(jugador => {
  if (jugador.ladrillos && jugador.ladrillos.length > 0) {
    jugador.ladrillos.forEach(ladrillo => ladrillo.update());
  }
});

  // Limpiar arrays de ladrillos tocados al final de cada frame
  this.toca.Ladrillo.Celeste = this.toca.Ladrillo.Celeste.filter(lad =>
    this.physics.overlap(this.Celeste, lad)
  );
  this.toca.Ladrillo.Naranja = this.toca.Ladrillo.Naranja.filter(lad =>
    this.physics.overlap(this.Naranja, lad)
  );
  
  // --- NUEVO: actualizar todos los materiales ---
  this.materiales.forEach(material => {
    if (material && typeof material.update === "function") material.update();
  });

// --- Aumentar hitbox interna de cada jugador si está tocando la construcción ---
if (this.Construccion.hitboxInternaSupCeleste) {
  if (this.physics.overlap(this.Celeste, this.Construccion)) {
    this.Construccion.hitboxInternaSupCeleste.setSize(405, 205);
  } else {
    this.Construccion.hitboxInternaSupCeleste.setSize(405, 9);
  }
}
if (this.Construccion.hitboxInternaSupNaranja) {
  if (this.physics.overlap(this.Naranja, this.Construccion)) {
    this.Construccion.hitboxInternaSupNaranja.setSize(405, 205);
  } else {
    this.Construccion.hitboxInternaSupNaranja.setSize(405, 9);
  }
}
}
}