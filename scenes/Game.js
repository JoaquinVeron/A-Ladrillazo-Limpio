class Jugador extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);
  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setCollideWorldBounds(true).setScale(0.3).refreshBody();
  this.ladrillos = [];
}
}

class Vehiculo extends Phaser.Physics.Arcade.Sprite {
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
    jugador.Intangible = true;
    jugador.Aturdido = true;

    // Vibración de la cámara
    this.scene.cameras.main.shake(100, 0.005); // 100ms, intensidad 0.005

    // Parpadeo
    jugador.blinkEvent = this.scene.time.addEvent({
      delay: 200,
      callback: () => { jugador.alpha = jugador.alpha === 0.5 ? 1 : 0.5; },
      repeat: 24
    });

    jugador.body.enable = false;
    jugador.alpha = 0.5;
    jugador.setTint(0xff0000);

    // Termina aturdimiento (3s)
    this.scene.time.delayedCall(3000, () => {
      jugador.Aturdido = false;
      jugador.alpha = 0.5;
      jugador.setTint(0xffffff);
      jugador.body.enable = true;
    });

    // Termina intangibilidad (5s)
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

class Material extends Phaser.Physics.Arcade.Sprite {
constructor(scene, x, y, texture) {
  super(scene, x, y, texture);
  scene.add.existing(this);
  scene.physics.add.existing(this);

  this.setImmovable(true);

  this.portadorBalde = null; // Jugador que lo lleva (null si está en el piso)
  this.lleno = false; // Solo para el balde
  this.portadorLadrillo = null; // Jugador que lo lleva (null si está en el piso)

  // Si es la mezcladora, agregamos contadores
  if (texture === "Mezcladora") {
    this.arenaCount = 0;
    this.gravaCount = 0;
  }

  if (texture === "Cemento") {
    this.cementoCount = 0;
    this.ladrilloCount = 0;
  }
}

// ---------- BALDE ----------
interactuarBalde(jugador) {
  if (this.scene.toca.Balde[jugador.texture.key] &&
    !jugador.ManosOcupadas &&
    !jugador.Aturdido && 
    this.portadorBalde === null) {
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
      this.setTexture("BaldeCemento");
      this.lleno = true;
      console.log(`${jugador.texture.key} llenó el balde con cemento`);
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
  if (this.scene.toca.Ladrillos[jugador.texture.key] &&
    !jugador.ManosOcupadas &&
    !jugador.Aturdido &&
    this.portadorLadrillo === null) {
    this.levantarLadrillo(jugador);
    console.log(`${jugador.texture.key} levantó ladrillos`);
  } else if (this.portadorLadrillo === jugador) {
    this.soltarLadrillo(jugador);
    console.log(`${jugador.texture.key} soltó el ladrillo`);
}
}

levantarLadrillo(jugador) {
  if (jugador.ladrillos.length < 3 && !jugador.Aturdido) {
    jugador.ManosOcupadas = true;
    jugador.llevaLadrillo = true;
    // Calcula la posición Y del nuevo ladrillo
    const offsetY = 25 - (jugador.ladrillos.length * 24);
    const ladrillo = new Material(
      this.scene,
      jugador.x + 20,
      jugador.y + offsetY,
      "Ladrillo"
    ).setScale(0.5).setDepth(1);
    ladrillo.portadorLadrillo = jugador;
    jugador.ladrillos.push(ladrillo);

    // Overlap para el ladrillo individual
    this.scene.physics.add.overlap(this.scene.Celeste, ladrillo, () => {
      this.scene.toca.Ladrillo.Celeste = true;
    });
    this.scene.physics.add.overlap(this.scene.Naranja, ladrillo, () => {
      this.scene.toca.Ladrillo.Naranja = true;
    });

    console.log(`${jugador.texture.key} levantó un ladrillo (${jugador.ladrillos.length}/3)`);
  }
}

soltarLadrillo(jugador) {
  if (jugador.ladrillos.length > 0) {
    const ladrillo = jugador.ladrillos.pop();
    ladrillo.portadorLadrillo = null;
    ladrillo.x = jugador.x + 40;
    ladrillo.y = jugador.y + 50;
    ladrillo.setDepth(0);
    console.log(`${jugador.texture.key} soltó un ladrillo (${jugador.ladrillos.length}/3)`);
    if (jugador.ladrillos.length === 0) {
      jugador.ManosOcupadas = false;
      jugador.llevaLadrillo = false;
    }
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
  // Crear el cemento y guardar la referencia
  const Cemento = new Material(this.scene, this.x + 150, this.y, "Cemento");
  this.scene.Cemento = Cemento;
  // Agregar overlap dinámicamente
  this.scene.physics.add.overlap(this.scene.Celeste, Cemento, () => {
    this.scene.toca.Cemento.Celeste = true;
  });
  this.scene.physics.add.overlap(this.scene.Naranja, Cemento, () => {
    this.scene.toca.Cemento.Naranja = true;
  });
  console.log("Se generó un balde de cemento");
  console.log("La mezcladora está lista para otro uso");
});
}

// ---------- CONSTRUCCION ----------
// Si 2 de cemento y 3 ladrillos son dejados aqui, la construccion cambia de color
avanzarConstruccion() {
  // Chequear si ya tiene todos los elementos y cambiar a rojo
    if (this.ladrilloCount === 1) {
      this.setTint(0x179C35);
    }
}

update() {
  // Si alguien lo lleva, seguir al portador
  if (this.portadorBalde) {
    this.x = this.portadorBalde.x + 20;
    this.y = this.portadorBalde.y + 50;
    this.setDepth(this.portadorBalde.depth + 1);
  } else if (this.portadorLadrillo) {
    const idx = this.portadorLadrillo.ladrillos.indexOf(this);
    // Apila los ladrillos con offset vertical
    this.x = this.portadorLadrillo.x;
    this.y = this.portadorLadrillo.y + 25 - (idx * 24);
}
}
}

export default class Game extends Phaser.Scene {
constructor() {
  super("game");
}

preload() {
  this.load.image("Calle", "public/assets/Calle.png");
  this.load.image("Celeste1", "public/assets/1.png");
  this.load.image("Naranja2", "public/assets/2.png");
  this.load.image("Celeste", "public/assets/Celeste.png");
  this.load.image("Naranja", "public/assets/Naranja.png");
  this.load.image("Auto", "public/assets/auto.png");
  this.load.image("Camion", "public/assets/Camion.png");
  this.load.image("Construccion", "public/assets/Construccion.png");
  this.load.image("Moto", "public/assets/Moto.png");
  this.load.image("Arena", "public/assets/Arena.png");
  this.load.image("Balde", "public/assets/Balde.png");
  this.load.image("BaldeArena", "public/assets/BaldeArena.png");
  this.load.image("BaldeGrava", "public/assets/BaldeGrava.png");
  this.load.image("BaldeCemento", "public/assets/BaldeCemento.png");
  this.load.image("Barrera", "public/assets/BloqueDivisor.png");
  this.load.image("Carretilla", "public/assets/Carretilla.png");
  this.load.image("Cemento", "public/assets/Cemento.png");
  this.load.image("Coca", "public/assets/Coca.png");
  this.load.image("Cuchara", "public/assets/Cuchara.png");
  this.load.image("Espatula", "public/assets/Espatula.png");
  this.load.image("Grava", "public/assets/Grava.png");
  this.load.image("Ladrillos", "public/assets/Ladrillos.png");
  this.load.image("Ladrillo", "public/assets/Ladrillo.png");
  this.load.image("Llana", "public/assets/Llana.png");
  this.load.image("Mezcladora", "public/assets/Mezcladora.png");
  this.load.image("Pala", "public/assets/Pala.png");
  this.load.image("Pasto", "public/assets/Pasto.jpg");
  this.load.audio("Arena", "public/assets/Arena.mp3");
  this.load.audio("Bocina", "public/assets/Bocina.mp3");
  this.load.audio("Bocina2", "public/assets/Bocina2.mp3");
  this.load.audio("Bocina3", "public/assets/Bocina3.mp3");
  this.load.audio("RecGrava", "public/assets/RecGrava.mp3");
  this.load.audio("SonidoCarretera", "public/assets/SonidoCarretera.mp3");
  this.load.audio("SonidoCarretera2", "public/assets/SonidoCarretera2.mp3");

}

create() {

// ----------- CÁMARA ----------

  // Configura el zoom de la cámara
  this.cameras.main.setZoom(1.00175); // Ajusta el valor según lo que prefieras

  // Pantalla negra inicial
  this.cameras.main.fadeIn(3000); // 3 segundos

  // Centro de la cámara
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  console.log("CenterX:", centerX, "CenterY:", centerY);

  // Teclas para interactuar
  this.eKey = this.input.keyboard.addKey('E');
  this.fKey = this.input.keyboard.addKey('F');

  // Inicializa los cursores
  this.cursors = this.input.keyboard.createCursorKeys();

  // Tecla del 1 al 3 del teclado numérico derecho para Naranja
  this.numpad1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
  this.numpad2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
  this.numpad3Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);

  // Pasto de fondo
  this.add.image(centerX, centerY, "Pasto")
  .setOrigin(0.5)
  .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
  .setAlpha(0.4);

  // Limita la cámara a los bordes del mapa
  const margenX = 0; // margen horizontal
  const margenY = 0; // margen vertical
  const anchoMapa = this.cameras.main.width;
  const altoMapa = this.cameras.main.height;
  this.anchoMapa = anchoMapa;
  this.altoMapa = altoMapa;
  this.cameras.main.setBounds(margenX, margenY, anchoMapa - margenX * 2, altoMapa - margenY * 2);

  // ----------- CALLES ----------
  
  //Grupo de calles
  this.Calles = this.physics.add.group();
  this.CalleIZQ = this.add.image(centerX - 200, centerY, "Calle").setOrigin(0.5);
  this.CalleDER = this.add.image(centerX + 200, centerY, "Calle").setOrigin(0.5);

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
    const barrera = this.physics.add.sprite(centerX, y, "Barrera").setImmovable(true);
    this.barreras.push(barrera);
  }

  // ---------- JUGADORES ----------
  
  this.Celeste = new Jugador(this, centerX - 500, centerY + 75, "Celeste");
  this.Naranja = new Jugador(this, centerX - 500, centerY + 225, "Naranja");

  // Grupo de jugadores
  this.jugadores = this.physics.add.group();
  this.jugadores.add(this.Celeste);
  this.jugadores.add(this.Naranja);
  this.Celeste.setCollideWorldBounds(true);
  this.Naranja.setCollideWorldBounds(true);
  this.jugadores.Intangible = false;
  this.jugadores.Aturdido = false;
  this.jugadores.ManosOcupadas = false;
  this.jugadores.setDepth(1);

  // Colisión entre jugadores
  this.physics.add.collider(this.Celeste, this.Naranja);
  // Colisión entre jugadores y barreras
  this.physics.add.collider(this.jugadores, this.barreras);

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
      const tipo = Phaser.Utils.Array.GetRandom(tipos);

      let velocidad = 600;
      let scale = 0.25;

      if (tipo === "Camion") {
        velocidad = 550;
        color = 0xffffff;
        scale = 0.35;
        // Ajusta la posición Y del camión según dirección
        if (direction === 1) {
          y -= 60; // camión que va hacia abajo, aparece más arriba
        } else {
          y += 60; // camión que va hacia arriba, aparece más abajo
        }
      }

      this.spawnVehicle(this.autos, x, y, tipo, {
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
  const velocidad = (1000); // motos más rápidas

  this.spawnVehicle(this.motos, x, y, "Moto", {
    velocidad,
    direction,
    scale: 0.25,
    size: { width: 200, height: 350 },
    immovable: true
  });
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

  sound.play({ volume: 0.01, rate: 1, detune: 100 });
});
}

// Iniciar el loop aleatorio
this.reproducirCarretera();

  // ---------- HERRAMIENTAS ----------

  this.Arena = new Material(this, centerX + 800, centerY - 300, "Arena").setScale(0.5);
  this.Balde = new Material(this, centerX - 400, centerY + 150, "Balde").setScale(0.5).setDepth(0);
  this.Construccion = new Material(this, centerX - 650, centerY - 300, "Construccion");
  this.Grava = new Material(this, centerX + 800, centerY + 300, "Grava").setScale(0.25);
  this.Ladrillos = new Material(this, centerX + 800, centerY, "Ladrillos").setScale(0.5);
  this.Mezcladora = new Material(this, centerX - 800, centerY + 300, "Mezcladora").setScale(0.5);

  // FLAGS DE COLISIONES (para manejar interacciones)
  this.toca = {
  Arena: { Celeste: false, Naranja: false },
  Balde: { Celeste: false, Naranja: false },
  Construccion: { Celeste: false, Naranja: false },
  Cemento: { Celeste: false, Naranja: false },
  Grava: { Celeste: false, Naranja: false },
  Ladrillos: { Celeste: false, Naranja: false },
  Ladrillo: { Celeste: false, Naranja: false },
  Mezcladora: { Celeste: false, Naranja: false }
};

const crearOverlap = (jugador, objeto, nombre) => { 
this.physics.add.overlap(jugador, objeto, () => { 
    this.toca[nombre][jugador.texture.key === "Celeste" ? "Celeste" : "Naranja"] = true;
    if (nombre === "Ladrillos") {
      console.log("Overlap ladrillos:", jugador.texture.key);
    }
  });
};

crearOverlap(this.Celeste, this.Balde, "Balde");
crearOverlap(this.Naranja, this.Balde, "Balde");
crearOverlap(this.Celeste, this.Arena, "Arena");
crearOverlap(this.Naranja, this.Arena, "Arena");
crearOverlap(this.Celeste, this.Grava, "Grava");
crearOverlap(this.Naranja, this.Grava, "Grava");
crearOverlap(this.Celeste, this.Ladrillos, "Ladrillos");
crearOverlap(this.Naranja, this.Ladrillos, "Ladrillos");
crearOverlap(this.Celeste, this.Mezcladora, "Mezcladora");
crearOverlap(this.Naranja, this.Mezcladora, "Mezcladora");
}

spawnVehicle(group, x, y, key, opts = {}) {
const veh = new Vehiculo(this, x, y, key);
group.add(veh);
veh.configure(opts);
return veh;
}

interactuar(jugador, tecla) {
  if (Phaser.Input.Keyboard.JustDown(tecla)) {
    // Si está tocando el balde, interactúa con el balde
     if (this.toca.Balde[jugador.texture.key]) {
      this.Balde.interactuarBalde(jugador, tecla);
     } // Si está tocando la pila y puede levantar más
     else if (
      this.toca.Ladrillos[jugador.texture.key] &&
      jugador.ladrillos.length < 3 &&
      !jugador.Aturdido &&
      !jugador.ManosOcupadas  
    ) {
      this.Ladrillos.levantarLadrillo(jugador);
    }
    // Si NO está tocando la pila y lleva ladrillos, suelta uno
    else if (
      !this.toca.Ladrillos[jugador.texture.key] &&
      jugador.ladrillos.length > 0
    ) {
      jugador.ladrillos[jugador.ladrillos.length - 1].soltarLadrillo(jugador);
    }
    }
  }

interactuarMaterial(jugador, key, material, flag) {
if (this.toca[flag][jugador.texture.key] && jugador.llevaBalde) {
  this.Balde.llenarBalde(jugador, key, material);
}
this.toca[flag][jugador.texture.key] = false;
}

interactuarMezcladora(jugador, key) {
if (this.toca.Mezcladora[jugador.texture.key] && jugador.llevaBalde) {
  if (this.Balde.texture.key === "BaldeArena") {
    this.Mezcladora.cargarMaquina(jugador, key, this.Arena);
  } else if (this.Balde.texture.key === "BaldeGrava") {
    this.Mezcladora.cargarMaquina(jugador, key, this.Grava);
  }
}
this.toca.Mezcladora[jugador.texture.key] = false;
}


// ---------- MOVIMIENTO JUGADORES ----------
moverJugador(jugador, teclas, correrKey) {
  let speed = 250;
  // Si el jugador lleva el balde con arena, va más lento
  if (jugador.ManosOcupadas && this.Balde.lleno) {
    speed = 150;
  }
  // Resta velocidad por cada ladrillo
  if (jugador.ladrillos && jugador.ladrillos.length > 0) {
    speed *= (1 - 0.1 * jugador.ladrillos.length);
  }

  // Movimiento del jugador
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

    // Correr
    if (correrKey.isDown) {
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

  // TECLAS CELESTE
  const teclasCeleste = {
    izq: this.input.keyboard.addKey('A'),
    der: this.input.keyboard.addKey('D'),
    arriba: this.input.keyboard.addKey('W'),
    abajo: this.input.keyboard.addKey('S')
  };
  const correrCeleste = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

  // TECLAS NARANJA
  const teclasNaranja = {
    izq: this.cursors.left,
    der: this.cursors.right,
    arriba: this.cursors.up,
    abajo: this.cursors.down
  };
  const correrNaranja = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

  this.moverJugador(this.Celeste, teclasCeleste, correrCeleste);
  this.moverJugador(this.Naranja, teclasNaranja, correrNaranja);

// ---------- INTERACCIONES ----------

// Interacción con E
this.interactuar(this.Celeste, this.eKey);
this.interactuar(this.Naranja, this.numpad1Key);

  this.toca.Balde.Celeste = false;
  this.toca.Balde.Naranja = false;
  this.toca.Ladrillos.Celeste = false;
  this.toca.Ladrillos.Naranja = false;

// Interacción con los materiales
this.interactuarMaterial(this.Celeste, this.fKey, this.Arena, "Arena"); 
this.interactuarMaterial(this.Naranja, this.numpad2Key, this.Arena, "Arena");
this.interactuarMaterial(this.Celeste, this.fKey, this.Grava, "Grava");
this.interactuarMaterial(this.Naranja, this.numpad2Key, this.Grava, "Grava");
this.interactuarMaterial(this.Celeste, this.fKey, this.Cemento, "Cemento");
this.interactuarMaterial(this.Naranja, this.numpad2Key, this.Cemento, "Cemento");

// ---------- INTERACCION CON LA MEZCLADORA ----------

this.interactuarMezcladora(this.Celeste, this.fKey);
this.interactuarMezcladora(this.Naranja, this.numpad2Key);

// --- NUEVO BLOQUE PARA VACIAR BALDE MANTENIENDO F ---
[this.Celeste, this.Naranja].forEach(jugador => {
  // Si el jugador lleva el balde y está lleno
  if (
    jugador.llevaBalde &&
    this.Balde.lleno &&
    this.Balde.texture.key !== "Balde" &&
    !this.toca.Mezcladora[jugador.texture.key]
  ) {
    // Elige la tecla correcta
    const key = jugador === this.Celeste ? this.fKey : this.numpad2Key;

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

  // Actualizar posición del balde si alguien lo lleva
  this.Balde.update();

   // Actualizar posición del ladrillo individual si algún jugador lo lleva
  [this.Celeste, this.Naranja].forEach(jugador => {
  if (jugador.ladrillos && jugador.ladrillos.length > 0) {
    jugador.ladrillos.forEach(ladrillo => ladrillo.update());
  }
});

  // Calcular el punto medio entre ambos jugadores
  let medioX = (this.Celeste.x + this.Naranja.x) / 2;
  let medioY = (this.Celeste.y + this.Naranja.y) / 2;

  // Limitar el centro de la cámara dentro de los márgenes
  const minX = this.cameras.main.displayWidth / 2;
  const maxX = this.anchoMapa - this.cameras.main.displayWidth / 2;
  const minY = this.cameras.main.displayHeight / 2;
  const maxY = this.altoMapa - this.cameras.main.displayHeight / 2;

  medioX = Phaser.Math.Clamp(medioX, minX, maxX);
  medioY = Phaser.Math.Clamp(medioY, minY, maxY);

  this.cameras.main.centerOn(medioX, medioY);

  // Solo pan si el punto medio cambió significativamente
  if (
  Math.abs(this.cameras.main.scrollX + this.cameras.main.displayWidth / 2 - medioX) > 2 ||
  Math.abs(this.cameras.main.scrollY + this.cameras.main.displayHeight / 2 - medioY) > 2
  ) {
  this.cameras.main.pan(medioX, medioY, 250, 'Sine.easeInOut', false);
  }
}
}