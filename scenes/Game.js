import Jugador from "../clases/Jugador.js";
import Vehiculo from "../clases/Vehiculo.js";
import Material from "../clases/Material.js";
import InputSystem, { INPUT_ACTIONS } from "../system/InputSystem.js";

export default class Game extends Phaser.Scene {
constructor() {
  super("game");
}

create() {

// ----------- CÁMARA ----------

  // Configura el zoom de la cámara
  this.cameras.main.setZoom(1); // Ajusta el valor según lo que prefieras

  // Pantalla negra inicial
  this.cameras.main.fadeIn(1000); // 3 segundos

  // Centro de la cámara
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  console.log("CenterX:", centerX, "CenterY:", centerY);

  // InputSystem
  this.inputSystem = new InputSystem(this.input);
  this.inputSystem.configureKeyboard({
   [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
   [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
   [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
   [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
   [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.E],
   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.F],
   [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.SHIFT],
  },
  "player1"
);

  // Teclas para interactuar
  this.eKey = this.input.keyboard.addKey('E');
  this.fKey = this.input.keyboard.addKey('F');
  this.jKey = this.input.keyboard.addKey('J');
  this.kKey = this.input.keyboard.addKey('K');
  this.lKey = this.input.keyboard.addKey('L');

  // Tecla para lanzar ladrillos (apuntar + lanzar)
  this.qKey = this.input.keyboard.addKey('Q');
  
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
  //this.add.image(centerX, centerY, "Sombreado").setDepth(4);

  // Pasto de fondo
  this.pasto = this.add.image(centerX, centerY, "Pasto")
  .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  // Pasto detalle
  this.add.image(centerX, centerY, "PastoDetalle")
  .setOrigin(0.5)
  .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
  .setAlpha(1)
  .setDepth(1);

  // Borde
  this.add.image(centerX, centerY, "Borde").setDepth(5);

  // ----------- CALLES ----------
  
  //Grupo de calles
  this.Calles = this.physics.add.group();
  this.CalleIZQ = this.add.image(centerX - 210, centerY, "Calle").setOrigin(0.5);
  this.CalleDER = this.add.image(centerX + 210, centerY, "Calle").setOrigin(0.5);

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
    const barrera = this.physics.add.sprite(centerX, y, "Barrera").setImmovable(true).setDepth(1);
    this.barreras.push(barrera);
  }

  // ---------- JUGADORES ----------
  
  this.Celeste = new Jugador(this, centerX - 500, centerY + 125, "Celeste");
  this.Naranja = new Jugador(this, centerX - 500, centerY + 425, "Naranja");

  // Grupo de jugadores
  this.jugadores = this.physics.add.group();
  this.jugadores.add(this.Celeste);
  this.jugadores.add(this.Naranja);
  this.Celeste.setCollideWorldBounds(true);
  this.Naranja.setCollideWorldBounds(true);
  this.jugadores.Intangible = false;
  this.jugadores.Aturdido = false;
  this.jugadores.ManosOcupadas = false;
  this.jugadores.setDepth(2);

  // Colisión entre jugadores
  this.colliderJugadores = this.physics.add.collider(this.Celeste, this.Naranja);

  // Colisión entre jugadores y barreras
  this.physics.add.collider(this.jugadores, this.barreras);

  // Calcular el punto medio entre ambos jugadores
  const medioX = (this.Celeste.x + this.Naranja.x) / 2;
  const medioY = (this.Celeste.y + this.Naranja.y) / 2;

  // ---------- VEHICULOS ----------

  // Grupos de vehículos
  this.autos = this.physics.add.group({ runChildUpdate: true });
  this.motos = this.physics.add.group({ runChildUpdate: true });

  // Funcion para obtener un color aleatorio
  const randomColor = () => {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // ---------- AUTOS Y CAMIONES ----------

  // Posiciones posibles 
  const posVeh = [
    { x: CalleIZQCenter - 80, y: -100 },
    { x: CalleIZQCenter + 80, y: -100 },
    { x: CalleDERCenter - 80, y: 1180 },
    { x: CalleDERCenter + 80, y: 1180 },
  ];

  // Funcion para obtener un delay aleatorio de spawn
  const randomDelayAuto = () => {
    return Phaser.Math.Between(400, 500);
  }

  // Evento para autos y camiones
  this.time.addEvent({
    delay: randomDelayAuto(),
    loop: true,
    callback: () => {
      let { x, y } = Phaser.Utils.Array.GetRandom(posVeh);
      const direction = y > centerY ? -1 : 1;
      let color = randomColor();

      // Verifica si hay un vehículo cerca del spawn
      const distanciaMinima = 450;
      let puedeGenerar = true;
      this.autos.getChildren().forEach(veh => {
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

      // --- CAMBIO: elegir textura de camión según lado ---
      let texturaCamion = "Camion";
      if (tipo === "Camion") {
        velocidad = 550;
        color = 0xffffff;
        scale = 0.35;
        if (direction === 1) {
          y -= 60;
        } else {
          y += 60;
        }
        if (x > centerX) {
          texturaCamion = "Camion2"; // lado derecho
        }
      }

      // Usar la textura correcta
      const texturaFinal = tipo === "Camion" ? texturaCamion : tipo;

      this.spawnVehicle(this.autos, x, y, texturaFinal, {
        velocidad,
        color,
        direction,
        scale,
        immovable: true
      });
    }
  });

  // Colisión única
  this.physics.add.overlap(
  this.autos,
  this.jugadores,
  (auto, jugador) => {
  auto.handleCollision(jugador);

  // Si el jugador lleva un material, soltarlo
  if (this.Balde.portadorBalde === jugador) {
    this.Balde.soltarBalde(jugador);
  }
},
(auto, jugador) => !jugador.Intangible // processCallback → solo si no es intangible
);

  // ---------- MOTOS ----------

  const posMotos = [
{ x: CalleIZQCenter, y: -100 },
{ x: CalleDERCenter, y: 1180 },
];

  // Funcion para obtener un delay aleatorio
  const randomDelayMoto = () => {
    return Phaser.Math.Between(2000, 8000);
  }

  // evento para motos (más rápidas)
  this.time.addEvent({
  delay: randomDelayMoto(),
  loop: true,
  callback: () => {
    const { x, y } = Phaser.Utils.Array.GetRandom(posMotos);
    const direction = y > centerY ? -1 : 1;
    const velocidad = 1000; // motos más rápidas

    this.spawnVehicle(this.motos, x, y, "Moto", {
      velocidad,
      direction,
      scale: 0.25,
      size: { width: 200, height: 350 },
      immovable: true
    });

    // --- 1 de cada 5 motos reproduce un sonido ---
    if (Phaser.Math.Between(1, 5) === 1) {
      this.sound.play("RuidoMoto", { volume: 1});
    }
  }
});

  // Colisión única
  this.physics.add.overlap(
  this.motos,
  this.jugadores,
  (moto, jugador) => {
  moto.handleCollision(jugador);

  // Si el jugador lleva un material, soltarlo
  if (this.Balde.portadorBalde === jugador) {
    this.Balde.soltarBalde(jugador);
  }
},
(moto, jugador) => !jugador.Intangible // processCallback → solo si no es intangible
);

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

  // ---------- HERRAMIENTAS ----------
  this.Arena = new Material(this, centerX + 700, centerY - 300, "Arena").setScale(0.5);
  this.Balde = new Material(this, medioX, medioY, "Balde").setScale(0.5).setDepth(0);
  this.Construccion = new Material(this, centerX - 649, centerY - 175, "Construccion").setDepth(-1).setScale(1);
  this.Grava = new Material(this, centerX + 700, centerY + 300, "Grava").setScale(0.5);
  this.Ladrillos = new Material(this, centerX + 700, centerY, "Ladrillos").setScale(0.5);
  this.Mezcladora = new Material(this, centerX - 800, medioY, "Mezcladora").setScale(0.5);
  

  // --- NUEVO: array con todos los materiales excepto Construccion ---
  this.materiales = [
    this.Arena,
    this.Balde,
    this.Grava,
    this.Ladrillos,
    this.Mezcladora,
    this.Construccion
    // Si agregás más materiales, ponelos acá
  ];

  // FLAGS DE COLISIONES (para manejar interacciones)
  this.toca = {
  Ladrillo: { Celeste: [], Naranja: [] }, 
};

// ---------- TEXTO DE PROGRESO DE CONSTRUCCIÓN CON ICONOS ----------

// Ícono de balde de cemento
this.iconoCemento = this.add.image(
  this.Construccion.x - 80,
  this.Construccion.y,
  "BaldeCemento")
  .setScale(0.5)
  .setDepth(4);

// Texto de cantidad de cemento
this.textoCemento = this.add.text(
  this.iconoCemento.x,
  this.iconoCemento.y - 80,
  "0/2", {
  fontFamily: "ActionComicsBlack",
  fontSize: "20px",
  color: "#ffffffff",
  stroke: "#000000ff",
  strokeThickness: 4
}).setOrigin(0.5, 0)
  .setDepth(4);

// Ícono de ladrillo
this.iconoLadrillo = this.add.image(
  this.Construccion.x + 80,
  this.Construccion.y + 10,
  "Ladrillo"
).setScale(0.65)
  .setDepth(4);

// Texto de cantidad de ladrillos
this.textoLadrillo = this.add.text(
  this.iconoLadrillo.x,
  this.iconoLadrillo.y - 90,
  "0/3", {
  fontFamily: "ActionComicsBlack",
  fontSize: "20px",
  color: "#ffffffff",
  stroke: "#000000ff",
  strokeThickness: 4
}).setOrigin(0.5, 0)
  .setDepth(4);

// Función para actualizar los textos
this.actualizarTextoConstruccion = () => {
  const c = this.Construccion.cementoCount || 0;
  const l = this.Construccion.ladrilloCount || 0;
  const cMax = this.Construccion.cementoNecesario || 2;
  const lMax = this.Construccion.ladrilloNecesario || 3;
  this.textoCemento.setText(`${c}/${cMax}`);
  this.textoLadrillo.setText(`${l}/${lMax}`);
  if (c >= cMax) {
    this.textoCemento.setColor("#00ff00");
  } else {
    this.textoCemento.setColor("#ffffffff");
  }

  if (l >= lMax) {
    this.textoLadrillo.setColor("#00ff00");
  } else {
    this.textoLadrillo.setColor("#ffffffff");
  }
}

// Ejemplo para ambos jugadores y todos los materiales con hitbox interna
this.materiales.forEach(material => {
  if (material.hitboxInterna) {
    this.physics.add.collider(this.Celeste, material.hitboxInterna);
    this.physics.add.collider(this.Naranja, material.hitboxInterna);
  }
});

// --- TEMPORIZADOR ---
  this.tiempoRestante = 240; // 4 minutos en segundos
  this.textoTimer = this.add.text(
    150,
    60,
    "04:00",
    {
      fontFamily: "ActionComicsBlack",
      fontSize: "40px",
      color: "#ffffffff",
      stroke: "#000000",
      strokeThickness: 6
    }
  ).setOrigin(0.5).setDepth(4);

  this.gameOverMostrado = false;
}

spawnVehicle(group, x, y, key, opts = {}) {
const veh = new Vehiculo(this, x, y, key);
group.add(veh);
veh.configure(opts);
return veh;
}

interactuar(jugador, tecla) {
  // No permitir interacciones mientras apunta
  if (jugador.aiming) return;

  if (Phaser.Input.Keyboard.JustDown(tecla)) {
    // Balde
    if (this.physics.overlap(jugador, this.Balde)) {
      this.Balde.interactuarBalde(jugador, tecla);
    }
    // Pila de ladrillos
    else if (
      this.physics.overlap(jugador, this.Ladrillos) &&
      jugador.ladrillos.length < 3 &&
      !jugador.Aturdido &&
      !jugador.ManosOcupadas
    ) {
      this.Ladrillos.levantarLadrillo(jugador);
    }
    // Ladrillo individual en el suelo
    else if (
      this.toca.Ladrillo[jugador.texture.key].length > 0 &&
      jugador.ladrillos.length < 3 &&
      !jugador.Aturdido
    ) {
      const ladrillo = this.toca.Ladrillo[jugador.texture.key][0];
      ladrillo.levantarLadrilloSuelo(jugador, ladrillo);
    }
    // Soltar ladrillo si no está tocando la pila
    else if (
      !this.physics.overlap(jugador, this.Ladrillos) &&
      jugador.ladrillos.length > 0
    ) {
      jugador.ladrillos[jugador.ladrillos.length - 1].soltarLadrillo(jugador);
    }
  }
}

interactuarConstruccion(jugador, tecla) {
  if (jugador.aiming) return;

  if (Phaser.Input.Keyboard.JustDown(tecla)) {
    if (
      this.physics.overlap(jugador, this.Construccion) &&
      jugador.llevaBalde &&
      this.Balde.lleno &&
      this.Balde.texture.key === "BaldeCemento"
    ) {
      this.Construccion.recibirCemento(jugador);
    }
    else if (
      this.physics.overlap(jugador, this.Construccion) &&
      jugador.ladrillos.length > 0
    ) {
      this.Construccion.recibirLadrillo(jugador);
    }
  }
}

interactuarMaterial(jugador, tecla, material) {
  if (jugador.aiming) return;

  if (
    this.physics.overlap(jugador, material) &&
    jugador.llevaBalde
  ) {
    this.Balde.llenarBalde(jugador, tecla, material);
  }
}

interactuarMezcladora(jugador, key) {
  if (jugador.aiming) return;

  if (
    this.physics.overlap(jugador, this.Mezcladora) &&
    jugador.llevaBalde
  ) {
    if (this.Balde.texture.key === "BaldeArena") {
      this.Mezcladora.cargarMaquina(jugador, key, this.Arena);
    } else if (this.Balde.texture.key === "BaldeGrava") {
      this.Mezcladora.cargarMaquina(jugador, key, this.Grava);
    }
  }
}

interactuarLadrillo(jugador, key) {
  if (!(this.physics.overlap(jugador, this.Construccion))){
  
  if (Phaser.Input.Keyboard.JustDown(key)) {
    if (jugador.texture.key === "Celeste") {
      if (this.Celeste.aiming) {
        this.Celeste.lanzarLadrillo();
      } else {
        this.Celeste.startAiming();
      }
    }
    else if (jugador.texture.key === "Naranja") {
      if (this.Naranja.aiming) {
        this.Naranja.lanzarLadrillo();
      } else {
        this.Naranja.startAiming();
      }
    }
  }
}
}


// ---------- MOVIMIENTO JUGADORES ----------
moverJugador(jugador, teclas, correrKey) {
  const base = jugador.velocidadBase;
  let speed = base;

  // 1. Si lleva el balde lleno, velocidad fija 150
  if (jugador.llevaBalde && this.Balde.lleno) {
    speed = 150;
  }
  // 2. Si tiene ladrillos, reducir por ladrillo
  else if (jugador.ladrillos && jugador.ladrillos.length > 0) {
    speed = jugador.velocidadBase - 45 * jugador.ladrillos.length;
    if (speed < 60) speed = 60;
  }

  // --- Si el jugador está apuntando, mover la mira (IGNORAR SHIFT) ---
  if (jugador.aiming) {
    if (!jugador.aimCursor || !jugador.aimCursor.scene) {
      const texturaMira = (jugador.texture && jugador.texture.key === "Naranja") ? "MiraNaranja" : "MiraCeleste";
      jugador.aimCursor = this.add.image(jugador.x + 80, jugador.y, texturaMira)
        .setScale(0.25)
        .setDepth(3)
        .setAlpha(0.95);
    }

    // movimiento de la mira con la misma velocidad base (NO afecta SHIFT)
    const aimSpeed = 1000;
    let moveX = 0, moveY = 0;
    if (teclas.izq.isDown) moveX = -aimSpeed;
    else if (teclas.der.isDown) moveX = aimSpeed;
    if (teclas.arriba.isDown) moveY = -aimSpeed;
    else if (teclas.abajo.isDown) moveY = aimSpeed;

    const delta = (this.game && this.game.loop && this.game.loop.delta) ? this.game.loop.delta / 1000 : 0.016;
    jugador.aimCursor.x += moveX * delta;
    jugador.aimCursor.y += moveY * delta;

    const minX = this.cameras.main.scrollX + 20;
    const maxX = this.cameras.main.scrollX + this.cameras.main.displayWidth - 20;
    const minY = this.cameras.main.scrollY + 20;
    const maxY = this.cameras.main.scrollY + this.cameras.main.displayHeight - 20;
    jugador.aimCursor.x = Phaser.Math.Clamp(jugador.aimCursor.x, minX, maxX);
    jugador.aimCursor.y = Phaser.Math.Clamp(jugador.aimCursor.y, minY, maxY);

    // jugador completamente quieto mientras apunta
    jugador.setVelocity(0, 0);
    return;
  }

  // Movimiento normal del jugador (SHIFT aumenta velocidad)
  if (!jugador.Aturdido) {
    let velX = 0, velY = 0;

    if (teclas.izq.isDown) {
      velX = -speed;
      jugador.setFlipX(false);
    } else if (teclas.der.isDown) {
      velX = speed;
      jugador.setFlipX(true);
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

    jugador.setVelocityX(velX);
    jugador.setVelocityY(velY);
  } else {
    jugador.setVelocity(0);
  }
}

update() {
  // --- DETENER TODO EN GAME OVER ---
  if (this.gameOverMostrado) {
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
  const correrCeleste = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

  // TECLAS NARANJA
  const teclasNaranja = {
    izq: this.cursors.left,
    der: this.cursors.right,
    arriba: this.cursors.up,
    abajo: this.cursors.down
  };
  const correrNaranja = this.lKey;

  this.moverJugador(this.Celeste, teclasCeleste, correrCeleste);
  this.moverJugador(this.Naranja, teclasNaranja, correrNaranja);

  // ---------- INTERACCIONES ----------

// Interacción con E
this.interactuar(this.Celeste, this.eKey);
this.interactuar(this.Naranja, this.jKey);

// ---------- INTERACCION CON MATERIALES ----------
this.interactuarMaterial(this.Celeste, this.fKey, this.Arena, "Arena"); 
this.interactuarMaterial(this.Naranja, this.kKey, this.Arena, "Arena");
this.interactuarMaterial(this.Celeste, this.fKey, this.Grava, "Grava");
this.interactuarMaterial(this.Naranja, this.kKey, this.Grava, "Grava");
this.interactuarMaterial(this.Celeste, this.fKey, this.Cemento, "Cemento");
this.interactuarMaterial(this.Naranja, this.kKey, this.Cemento, "Cemento");

// ---------- INTERACCION CON LA MEZCLADORA ----------
this.interactuarMezcladora(this.Celeste, this.fKey);
this.interactuarMezcladora(this.Naranja, this.kKey);

// LANZAR LADRILLOS
this.interactuarLadrillo(this.Celeste, this.fKey);
this.interactuarLadrillo(this.Naranja, this.kKey);

// ---------- INTERACCION CON LA CONSTRUCCION ----------
this.interactuarConstruccion(this.Celeste, this.fKey);
this.interactuarConstruccion(this.Naranja, this.kKey);



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

// Actualizar texto de construcción
this.actualizarTextoConstruccion();

// Si el jugador toca la construccion y tiene la textura en "Construccion", ajustar tamaño de jugador, si no volver a la normalidad
[this.Celeste, this.Naranja].forEach(jugador => {
  // Inicializa la propiedad si no existe
  if (typeof jugador.estabaEnConstruccion === "undefined") {
    jugador.estabaEnConstruccion = false;
  }

  const enConstruccion = this.physics.overlap(jugador, this.Construccion) && this.Construccion.texture.key === "Construccion";
  const targetScale = enConstruccion ? 0.28 : 0.3;

  // Solo crear el tween si el estado cambió
  if (jugador.estabaEnConstruccion !== enConstruccion) {
    this.tweens.add({
      targets: jugador,
      scale: targetScale,
      duration: 400,
      ease: 'Sine.easeInOut'
    });
    jugador.estabaEnConstruccion = enConstruccion;
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

// --- TEMPORIZADOR ---
  if (!this.gameOverMostrado) {
    // Solo actualiza si no terminó el juego
    if (this.tiempoRestante > 0) {
      this.tiempoRestante -= this.game.loop.delta / 1000; // Resta segundos según delta
      if (this.tiempoRestante < 0) this.tiempoRestante = 0;

      // Formatea minutos y segundos
      const minutos = Math.floor(this.tiempoRestante / 60);
      const segundos = Math.floor(this.tiempoRestante % 60);
      const textoFormateado = `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
      this.textoTimer.setText(textoFormateado);

      // Cambia el color si quedan 10 segundos o menos
      if (this.tiempoRestante <= 10) {
        this.textoTimer.setColor("#ff0000");
      } else {
        this.textoTimer.setColor("#ffffffff");
      }


    } else {
      // GAME OVER
      this.gameOverMostrado = true;
      this.textoTimer.destroy();
      this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.7
      ).setDepth(4);

      this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "GAME OVER",
        {
          fontFamily: "ActionComicsBlack",
          fontSize: "80px",
          color: "#ff0000",
          stroke: "#000000",
          strokeThickness: 8
        }
      ).setOrigin(0.5).setDepth(4);
    }
  }
}
}