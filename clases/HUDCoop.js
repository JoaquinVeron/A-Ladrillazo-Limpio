export default class HUD extends Phaser.Scene {
  constructor() {
    super("HUD");
    this.targetSceneKey = null;
  }

  init(data) {
    this.targetSceneKey = data && data.sceneKey ? data.sceneKey : null;
  }

  getTargetScene() {
    // Si nos pasaron explícitamente la key, intentar obtenerla directamente
    if (this.targetSceneKey) {
      const s = this.scene.get(this.targetSceneKey);
      if (s) return s;
    }

    // Fallback: buscar entre las escenas cargadas una que parezca ser la escena de juego
    const mgrScenes = (this.scene.manager && this.scene.manager.scenes) ? this.scene.manager.scenes : [];
    for (const s of mgrScenes) {
      if (!s) continue;
      // varias formas de obtener la key de la escena según la versión/organización
      const key = (s.sys && s.sys.settings && s.sys.settings.key) || (s.scene && s.scene.key) || s.key || null;
      // Priorizar los keys explícitos si coinciden con los modos que conocemos
      if (key === "game" || key === "gameversus") return s;
      // Si tiene propiedades típicas de las escenas de juego, devolverla
      if (s.Celeste || s.Naranja || s.Construccion || s.Balde || s.Mezcladora) return s;
    }
    return null;
  }

  bindToScene(s) {
    if (!s || s.__hudBound) return;
    if (s.events && typeof s.events.on === 'function') {
      s.events.on('addTimeToHUD', this.sumarTiempo, this);
    }
    s.__hudBound = true;
  }

  create() {
    this.gameScene = this.getTargetScene();
    this.bindToScene(this.gameScene);

    this.centerX = this.cameras.main.centerX;
    this.centerY = this.cameras.main.centerY;

    const gs = this.gameScene;

    this.add.image(this.centerX, this.centerY, "Borde").setDepth(10);

    this.PantallaNegra = this.add.image(this.centerX, this.centerY, 'Madera').setDepth(9);
    this.tweens.add({
      targets: this.PantallaNegra,
      y: -1080,
      duration: 2000,
      ease: 'Power2',
    });

    // botones comunes
    this.BotonBaldeE = this.add.image(gs?.Balde?.x ?? 0, (gs?.Balde?.y ?? 0) - 75, "BotonE").setDepth(6);
    this.BotonLadrillosE = this.add.image(gs?.Ladrillos?.x ?? 0, (gs?.Ladrillos?.y ?? 0) - 150, "BotonE").setDepth(6);
    this.BotonLadrillosF = this.add.image(0, 0, "BotonF").setDepth(6);
    this.BotonArenaF = this.add.image(gs?.Arena?.x ?? 0, (gs?.Arena?.y ?? 0) - 100, "BotonF").setDepth(6);
    this.BotonGravaF = this.add.image(gs?.Grava?.x ?? 0, (gs?.Grava?.y ?? 0) - 100, "BotonF").setDepth(6);
    this.BotonMezcladoraF = this.add.image(gs?.Mezcladora?.x ?? 0, (gs?.Mezcladora?.y ?? 0) - 75, "BotonF").setDepth(6);
    this.BotonCementoF = this.add.image(this.centerX, this.centerY, "BotonF").setDepth(6).setAlpha(0);

    this.BotonBaldeJ = this.add.image(gs?.Balde?.x ?? 0, (gs?.Balde?.y ?? 0) - 75, "BotonJ").setDepth(6);
    this.BotonLadrillosJ = this.add.image(gs?.Ladrillos?.x ?? 0, (gs?.Ladrillos?.y ?? 0) - 150, "BotonJ").setDepth(6);
    this.BotonLadrillosK = this.add.image(gs?.Naranja?.x ?? 0, (gs?.Naranja?.y ?? 0) - 100, "BotonK").setDepth(6);
    this.BotonArenaK = this.add.image(gs?.Arena?.x ?? 0, (gs?.Arena?.y ?? 0) - 100, "BotonK").setDepth(6);
    this.BotonGravaK = this.add.image(gs?.Grava?.x ?? 0, (gs?.Grava?.y ?? 0) - 100, "BotonK").setDepth(6);
    this.BotonMezcladoraK = this.add.image(gs?.Mezcladora?.x ?? 0, (gs?.Mezcladora?.y ?? 0) - 75, "BotonK").setDepth(6);
    this.BotonCementoK = this.add.image(this.centerX, this.centerY, "BotonK").setDepth(6).setAlpha(0);

    // detectar modo versus (dos construcciones) o modo normal (una)
    this.isVersus = !!(gs?.ConstruccionCeleste && gs?.ConstruccionNaranja);

    // --- Leer preferencia para mostrar botones (registry > localStorage > default true) ---
    const prefKey = 'showHUDButtons';
    let show = this.registry.get(prefKey);
    if (typeof show === 'undefined') {
      const saved = localStorage.getItem(prefKey);
      show = saved === null ? true : saved === 'true';
      this.registry.set(prefKey, show);
    }
    this._showHUDButtons = !!show;

    // Exponer método para togglear visibilidad desde otras escenas
    this.setButtonsVisible = (visible) => {
      this._showHUDButtons = !!visible;
      // ajustar visibilidad de todos los sprites que son botones de tecla
      const btns = [
        this.BotonBaldeE, this.BotonLadrillosE, this.BotonLadrillosF, this.BotonArenaF,
        this.BotonGravaF, this.BotonMezcladoraF, this.BotonCementoF,
        this.BotonBaldeJ, this.BotonLadrillosJ, this.BotonLadrillosK, this.BotonArenaK,
        this.BotonGravaK, this.BotonMezcladoraK, this.BotonCementoK
      ];
      btns.forEach(b => { if (b && b.setVisible) b.setVisible(this._showHUDButtons); });
    };

    // Escuchar evento global como respaldo
    this.game.events.on('hud:toggle-buttons', (v) => {
      try { this.setButtonsVisible(!!v); } catch (e) {}
    });

    // Aplicar estado inicial
    this.setButtonsVisible(this._showHUDButtons);

    // UI Construcción Celeste
    if (this.isVersus) {
      this.iconoCementoCeleste = this.add.image(
        gs.ConstruccionCeleste.x - 80,
        gs.ConstruccionCeleste.y,
        "BaldeCemento"
      ).setScale(0.45).setDepth(6);
      this.textoCementoCeleste = this.add.text(
        this.iconoCementoCeleste.x,
        this.iconoCementoCeleste.y - 80,
        "0/2",
        { fontFamily: "ActionComicsBlack", fontSize: "18px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
      ).setOrigin(0.5, 0).setDepth(6);

      this.iconoLadrilloCeleste = this.add.image(
        gs.ConstruccionCeleste.x + 80,
        gs.ConstruccionCeleste.y + 10,
        "Ladrillo"
      ).setScale(0.6).setDepth(6);
      this.textoLadrilloCeleste = this.add.text(
        this.iconoLadrilloCeleste.x,
        this.iconoLadrilloCeleste.y - 90,
        "0/3",
        { fontFamily: "ActionComicsBlack", fontSize: "18px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
      ).setOrigin(0.5, 0).setDepth(6);

      // UI Construcción Naranja
      this.iconoCementoNaranja = this.add.image(
        gs.ConstruccionNaranja.x - 80,
        gs.ConstruccionNaranja.y,
        "BaldeCemento"
      ).setScale(0.45).setDepth(6);
      this.textoCementoNaranja = this.add.text(
        this.iconoCementoNaranja.x,
        this.iconoCementoNaranja.y - 80,
        "0/2",
        { fontFamily: "ActionComicsBlack", fontSize: "18px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
      ).setOrigin(0.5, 0).setDepth(6);

      this.iconoLadrilloNaranja = this.add.image(
        gs.ConstruccionNaranja.x + 80,
        gs.ConstruccionNaranja.y + 10,
        "Ladrillo"
      ).setScale(0.6).setDepth(6);
      this.textoLadrilloNaranja = this.add.text(
        this.iconoLadrilloNaranja.x,
        this.iconoLadrilloNaranja.y - 90,
        "0/3",
        { fontFamily: "ActionComicsBlack", fontSize: "18px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
      ).setOrigin(0.5, 0).setDepth(6);
    } else {
      // UI única (modo original)
      this.iconoCemento = this.add.image(
        gs?.Construccion?.x ?? (this.centerX - 80),
        gs?.Construccion?.y ?? this.centerY,
        "BaldeCemento"
      ).setScale(0.5).setDepth(6);

      this.textoCemento = this.add.text(
        this.iconoCemento.x,
        this.iconoCemento.y - 80,
        "0/2",
        { fontFamily: "ActionComicsBlack", fontSize: "20px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
      ).setOrigin(0.5, 0).setDepth(6);

      this.iconoLadrillo = this.add.image(
        gs?.Construccion?.x ?? (this.centerX + 80),
        (gs?.Construccion?.y ?? this.centerY) + 10,
        "Ladrillo"
      ).setScale(0.65).setDepth(6);

      this.textoLadrillo = this.add.text(
        this.iconoLadrillo.x,
        this.iconoLadrillo.y - 90,
        "0/3",
        { fontFamily: "ActionComicsBlack", fontSize: "20px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
      ).setOrigin(0.5, 0).setDepth(6);
    }

    // mezcladora UI (común)
    this.iconoArena = this.add.image(
      gs?.Mezcladora?.x ?? (this.centerX - 40),
      (gs?.Mezcladora?.y ?? this.centerY) - 80,
      "BaldeArena"
    ).setScale(0.35).setDepth(6);

    this.textoArena = this.add.text(
      this.iconoArena.x,
      this.iconoArena.y - 80,
      "0/2",
      { fontFamily: "ActionComicsBlack", fontSize: "20px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
    ).setOrigin(0.5, 0).setDepth(6);

    this.iconoGrava = this.add.image(
      gs?.Mezcladora?.x ?? (this.centerX + 40),
      (gs?.Mezcladora?.y ?? this.centerY) - 80,
      "BaldeGrava"
    ).setScale(0.35).setDepth(6);

    this.textoGrava = this.add.text(
      this.iconoGrava.x,
      this.iconoGrava.y - 80,
      "0/1",
      { fontFamily: "ActionComicsBlack", fontSize: "20px", color: "#ffffffff", stroke: "#000000ff", strokeThickness: 4 }
    ).setOrigin(0.5, 0).setDepth(6);

    // timer / reloj (reemplazar single timer por per-player en Versus)
    if (!this.isVersus) {
      this.relojIcono = this.add.image(this.centerX - 875, this.centerY - 455, "Reloj").setScale(1).setDepth(6);
      this.textoTimer = this.add.text(
        this.relojIcono.x + 160,
        this.relojIcono.y - 10,
        "04:00",
        { fontFamily: "ActionComicsBlack", fontSize: "40px", color: "#ffffffff", stroke: "#000000", strokeThickness: 6 }
      ).setOrigin(0.5).setDepth(6);
      this.tiempoRestante = 180;
      if (gs && typeof gs._pendingAddTiempo === 'number') {
        this.tiempoRestante += gs._pendingAddTiempo;
        delete gs._pendingAddTiempo;
      }
    } else {
      // Versus: crear dos timers visibles (Celeste arriba/izquierda, Naranja arriba/derecha)
      this.textoTimerCeleste = this.add.text(
        this.centerX - 800,
        this.centerY - 455,
        "03:00",
        { fontFamily: "ActionComicsBlack", fontSize: "36px", color: "#00bfff", stroke: "#000000", strokeThickness: 6 }
      ).setOrigin(0.5).setDepth(6);

      this.textoTimerNaranja = this.add.text(
        this.centerX + 800,
        this.centerY - 455,
        "03:00",
        { fontFamily: "ActionComicsBlack", fontSize: "36px", color: "#ff8c00", stroke: "#000000", strokeThickness: 6 }
      ).setOrigin(0.5).setDepth(6);

      // Si la escena tiene tiempo pendiente, aplicarlo
      if (gs && typeof gs._pendingAddTiempo === 'number') {
        gs.tiempoCeleste = (gs.tiempoCeleste || 180) + gs._pendingAddTiempo;
        gs.tiempoNaranja = (gs.tiempoNaranja || 180) + gs._pendingAddTiempo;
        delete gs._pendingAddTiempo;
      }
    }

    this._gameOverLocal = false;
    this._winLocal = false;
  }

  sumarTiempo(segundos) {
    this.tiempoRestante = (this.tiempoRestante || 0) + segundos;
  }

  update() {
    const newGs = this.getTargetScene();
    if (newGs && newGs !== this.gameScene) {
      this.gameScene = newGs;
      this.bindToScene(newGs);
    }
    const gs = this.gameScene;
    if (!gs) return;

    this.centerX = this.cameras.main.centerX;
    this.centerY = this.cameras.main.centerY;

    const safeSetColor = (txt, color) => { if (txt && txt.scene) txt.setColor(color); };
    const safeSetText = (txt, str) => { if (txt && txt.scene) txt.setText(str); };

    const baldeLleno = gs.Balde?.lleno;
    const hayCemento = !!gs.Cemento;

    // botones Jugador Celeste: usar construccionCeleste si existe, si no usar Construccion general
    const construccionCeleste = gs.ConstruccionCeleste ?? gs.Construccion;
    const construccionNaranja = gs.ConstruccionNaranja ?? gs.Construccion;

    if (this.BotonArenaF) {
      this.BotonArenaF.setAlpha(
        (gs.physics.overlap(gs.Celeste, gs.Arena) && !baldeLleno && gs.Celeste.llevaBalde) ? 1 : 0
      );
      this.BotonArenaF.setPosition(gs.Arena?.x ?? this.BotonArenaF.x, (gs.Arena?.y ?? this.BotonArenaF.y) - 100);
    }
    if (this.BotonGravaF) {
      this.BotonGravaF.setAlpha(
        (gs.physics.overlap(gs.Celeste, gs.Grava) && !baldeLleno && gs.Celeste.llevaBalde) ? 1 : 0
      );
      this.BotonGravaF.setPosition(gs.Grava?.x ?? this.BotonGravaF.x, (gs.Grava?.y ?? this.BotonGravaF.y) - 100);
    }
    if (this.BotonMezcladoraF) {
      this.BotonMezcladoraF.setAlpha(
        (gs.physics.overlap(gs.Celeste, gs.Mezcladora) && baldeLleno && gs.Celeste.llevaBalde && gs.Balde.texture?.key !== "BaldeCemento" && !gs.Cemento) ? 1 : 0
      );
      this.BotonMezcladoraF.setPosition(gs.Mezcladora?.x ?? this.BotonMezcladoraF.x, (gs.Mezcladora?.y ?? this.BotonMezcladoraF.y) - 75);
    }
    if (this.BotonLadrillosF) {
      if (construccionCeleste && gs.physics.overlap(gs.Celeste, construccionCeleste) && gs.Celeste.ladrillos.length >= 1) {
        this.BotonLadrillosF.setAlpha(1);
        this.BotonLadrillosF.setPosition(gs.Celeste.x, gs.Celeste.y - 100);
      } else {
        this.BotonLadrillosF.setAlpha(0);
        this.BotonLadrillosF.setPosition(gs.Ladrillos?.x ?? this.BotonLadrillosF.x, (gs.Ladrillos?.y ?? this.BotonLadrillosF.y) - 150);
      }
    }
    

    // Jugador Naranja
    if (this.BotonArenaK) {
      this.BotonArenaK.setAlpha(
        (gs.physics.overlap(gs.Naranja, gs.Arena) && !baldeLleno && gs.Naranja.llevaBalde) ? 1 : 0
      );
      this.BotonArenaK.setPosition(gs.Arena?.x ?? this.BotonArenaK.x, (gs.Arena?.y ?? this.BotonArenaK.y) - 100);
    }
    if (this.BotonGravaK) {
      this.BotonGravaK.setAlpha(
        (gs.physics.overlap(gs.Naranja, gs.Grava) && !baldeLleno && gs.Naranja.llevaBalde) ? 1 : 0
      );
      this.BotonGravaK.setPosition(gs.Grava?.x ?? this.BotonGravaK.x, (gs.Grava?.y ?? this.BotonGravaK.y) - 100);
    }
    if (this.BotonMezcladoraK) {
      this.BotonMezcladoraK.setAlpha(
        (gs.physics.overlap(gs.Naranja, gs.Mezcladora) && baldeLleno && gs.Naranja.llevaBalde && gs.Balde.texture?.key !== "BaldeCemento" && !gs.Cemento) ? 1 : 0
      );
      this.BotonMezcladoraK.setPosition(gs.Mezcladora?.x ?? this.BotonMezcladoraK.x, (gs.Mezcladora?.y ?? this.BotonMezcladoraK.y) - 75);
    }
    if (this.BotonLadrillosK) {
      if (construccionNaranja && gs.physics.overlap(gs.Naranja, construccionNaranja) && gs.Naranja.ladrillos.length >= 1) {
        this.BotonLadrillosK.setAlpha(1);
        this.BotonLadrillosK.setPosition(gs.Naranja.x, gs.Naranja.y - 100);
      } else {
        this.BotonLadrillosK.setAlpha(0);
        this.BotonLadrillosK.setPosition(gs.Naranja?.x ?? this.BotonLadrillosK.x, (gs.Naranja?.y ?? this.BotonLadrillosK.y) - 100);
      }
    }

    // Cemento (ambos jugadores) mantiene la lógica previa
    if (this.BotonCementoF && this.BotonCementoK) {
      if (hayCemento) {
        const celestePuedeCemento = gs.physics.overlap(gs.Celeste, gs.Cemento) && !baldeLleno && gs.Celeste.llevaBalde;
        const naranjaPuedeCemento = gs.physics.overlap(gs.Naranja, gs.Cemento) && !baldeLleno && gs.Naranja.llevaBalde;
        if (celestePuedeCemento && naranjaPuedeCemento) {
          this.BotonCementoF.setAlpha(1);
          this.BotonCementoK.setAlpha(1);
          this.BotonCementoF.setPosition(gs.Cemento.x - 40, gs.Cemento.y - 75);
          this.BotonCementoK.setPosition(gs.Cemento.x + 40, gs.Cemento.y - 75);
        } else {
          this.BotonCementoF.setAlpha(celestePuedeCemento ? 1 : 0);
          this.BotonCementoK.setAlpha(naranjaPuedeCemento ? 1 : 0);
          this.BotonCementoF.setPosition(gs.Cemento.x, gs.Cemento.y - 75);
          this.BotonCementoK.setPosition(gs.Cemento.x, gs.Cemento.y - 75);
        }
      } else {
        this.BotonCementoF.setAlpha(0);
        this.BotonCementoK.setAlpha(0);
      }
    }

    // Ladrillos (visibilidad en pila)
    const celestePuedeLadrillo = gs.physics.overlap(gs.Celeste, gs.Ladrillos) && gs.Celeste.ladrillos.length < 3 && !gs.Celeste.ManosOcupadas;
    const naranjaPuedeLadrillo = gs.physics.overlap(gs.Naranja, gs.Ladrillos) && gs.Naranja.ladrillos.length < 3 && !gs.Naranja.ManosOcupadas;

    if (this.BotonLadrillosE && this.BotonLadrillosJ) {
      if (celestePuedeLadrillo && naranjaPuedeLadrillo) {
        this.BotonLadrillosE.setAlpha(1);
        this.BotonLadrillosJ.setAlpha(1);
        this.BotonLadrillosE.setPosition((gs.Ladrillos?.x ?? this.BotonLadrillosE.x) - 40, (gs.Ladrillos?.y ?? this.BotonLadrillosE.y) - 150);
        this.BotonLadrillosJ.setPosition((gs.Ladrillos?.x ?? this.BotonLadrillosJ.x) + 40, (gs.Ladrillos?.y ?? this.BotonLadrillosJ.y) - 150);
      } else {
        this.BotonLadrillosE.setAlpha(celestePuedeLadrillo ? 1 : 0);
        this.BotonLadrillosJ.setAlpha(naranjaPuedeLadrillo ? 1 : 0);
        this.BotonLadrillosE.setPosition(gs.Ladrillos?.x ?? this.BotonLadrillosE.x, (gs.Ladrillos?.y ?? this.BotonLadrillosE.y) - 150);
        this.BotonLadrillosJ.setPosition(gs.Ladrillos?.x ?? this.BotonLadrillosJ.x, (gs.Ladrillos?.y ?? this.BotonLadrillosJ.y) - 150);
      }
    }

    // Balde (ambos jugadores)
    const celestePuedeBalde = gs.physics.overlap(gs.Celeste, gs.Balde) && !gs.Celeste.llevaBalde && !gs.Celeste.Aturdido && !gs.Celeste.ManosOcupadas && !gs.Naranja.llevaBalde;
    const naranjaPuedeBalde = gs.physics.overlap(gs.Naranja, gs.Balde) && !gs.Naranja.llevaBalde && !gs.Naranja.Aturdido && !gs.Naranja.ManosOcupadas && !gs.Celeste.llevaBalde;

    if (this.BotonBaldeE && this.BotonBaldeJ) {
      if (celestePuedeBalde && naranjaPuedeBalde) {
        this.BotonBaldeE.setAlpha(1);
        this.BotonBaldeJ.setAlpha(1);
        this.BotonBaldeE.setPosition((gs.Balde?.x ?? this.BotonBaldeE.x) - 40, (gs.Balde?.y ?? this.BotonBaldeE.y) - 75);
        this.BotonBaldeJ.setPosition((gs.Balde?.x ?? this.BotonBaldeJ.x) + 40, (gs.Balde?.y ?? this.BotonBaldeJ.y) - 75);
      } else {
        this.BotonBaldeE.setAlpha(celestePuedeBalde ? 1 : 0);
        this.BotonBaldeJ.setAlpha(naranjaPuedeBalde ? 1 : 0);
        this.BotonBaldeE.setPosition(gs.Balde?.x ?? this.BotonBaldeE.x, (gs.Balde?.y ?? this.BotonBaldeE.y) - 75);
        this.BotonBaldeJ.setPosition(gs.Balde?.x ?? this.BotonBaldeJ.x, (gs.Balde?.y ?? this.BotonBaldeJ.y) - 75);
      }
    }

    // actualizar UI construcción (modo normal o versus)
    if (!this.isVersus) {
      if (gs.Construccion) {
        this.iconoCemento.setPosition(gs.Construccion.x - 80, gs.Construccion.y);
        this.textoCemento.setPosition(this.iconoCemento.x, this.iconoCemento.y - 80);
        this.iconoLadrillo.setPosition(gs.Construccion.x + 80, gs.Construccion.y + 10);
        this.textoLadrillo.setPosition(this.iconoLadrillo.x, this.iconoLadrillo.y - 90);

        const c = gs.Construccion.cementoCount || 0;
        const l = gs.Construccion.ladrilloCount || 0;
        const cMax = gs.Construccion.cementoNecesario ?? 2;
        const lMax = gs.Construccion.ladrilloNecesario ?? 3;
        safeSetText(this.textoCemento, `${c}/${cMax}`);
        safeSetText(this.textoLadrillo, `${l}/${lMax}`);
        safeSetColor(this.textoCemento, c >= cMax ? "#00ff00" : "#ffffffff");
        safeSetColor(this.textoLadrillo, l >= lMax ? "#00ff00" : "#ffffffff");
      }
    } else {
      // actualizar UI Celeste
      if (gs.ConstruccionCeleste) {
        this.iconoCementoCeleste.setPosition(gs.ConstruccionCeleste.x - 80, gs.ConstruccionCeleste.y);
        this.textoCementoCeleste.setPosition(this.iconoCementoCeleste.x, this.iconoCementoCeleste.y - 80);
        this.iconoLadrilloCeleste.setPosition(gs.ConstruccionCeleste.x + 80, gs.ConstruccionCeleste.y + 10);
        this.textoLadrilloCeleste.setPosition(this.iconoLadrilloCeleste.x, this.iconoLadrilloCeleste.y - 90);

        const c = gs.ConstruccionCeleste.cementoCount || 0;
        const l = gs.ConstruccionCeleste.ladrilloCount || 0;
        const cMax = gs.ConstruccionCeleste.cementoNecesario ?? 2;
        const lMax = gs.ConstruccionCeleste.ladrilloNecesario ?? 3;
        safeSetText(this.textoCementoCeleste, `${c}/${cMax}`);
        safeSetText(this.textoLadrilloCeleste, `${l}/${lMax}`);
        safeSetColor(this.textoCementoCeleste, c >= cMax ? "#00ff00" : "#ffffffff");
        safeSetColor(this.textoLadrilloCeleste, l >= lMax ? "#00ff00" : "#ffffffff");
      }
      // actualizar UI Naranja
      if (gs.ConstruccionNaranja) {
        this.iconoCementoNaranja.setPosition(gs.ConstruccionNaranja.x - 80, gs.ConstruccionNaranja.y);
        this.textoCementoNaranja.setPosition(this.iconoCementoNaranja.x, this.iconoCementoNaranja.y - 80);
        this.iconoLadrilloNaranja.setPosition(gs.ConstruccionNaranja.x + 80, gs.ConstruccionNaranja.y + 10);
        this.textoLadrilloNaranja.setPosition(this.iconoLadrilloNaranja.x, this.iconoLadrilloNaranja.y - 90);

        const c = gs.ConstruccionNaranja.cementoCount || 0;
        const l = gs.ConstruccionNaranja.ladrilloCount || 0;
        const cMax = gs.ConstruccionNaranja.cementoNecesario ?? 2;
        const lMax = gs.ConstruccionNaranja.ladrilloNecesario ?? 3;
        safeSetText(this.textoCementoNaranja, `${c}/${cMax}`);
        safeSetText(this.textoLadrilloNaranja, `${l}/${lMax}`);
        safeSetColor(this.textoCementoNaranja, c >= cMax ? "#00ff00" : "#ffffffff");
        safeSetColor(this.textoLadrilloNaranja, l >= lMax ? "#00ff00" : "#ffffffff");
      }
    }

    // mezcladora UI
    if (gs.Mezcladora) {
      this.iconoArena.setPosition(gs.Mezcladora.x - 40, gs.Mezcladora.y - 80);
      this.textoArena.setPosition(this.iconoArena.x, this.iconoArena.y - 80);
      this.iconoGrava.setPosition(gs.Mezcladora.x + 40, gs.Mezcladora.y - 80);
      this.textoGrava.setPosition(this.iconoGrava.x, this.iconoGrava.y - 80);

      const arena = gs.Mezcladora.arenaCount || 0;
      const grava = gs.Mezcladora.gravaCount || 0;
      safeSetText(this.textoArena, `${arena}/2`);
      safeSetText(this.textoGrava, `${grava}/1`);
      safeSetColor(this.textoArena, arena >= 2 ? "#00ff00" : "#ffffffff");
      safeSetColor(this.textoGrava, grava >= 1 ? "#00ff00" : "#ffffffff");

      const celesteCerca = gs.physics.overlap(gs.Celeste, gs.Mezcladora);
      const naranjaCerca = gs.physics.overlap(gs.Naranja, gs.Mezcladora);
      const mostrar = celesteCerca || naranjaCerca;
      this.iconoArena.setAlpha(mostrar ? 1 : 0);
      this.textoArena.setAlpha(mostrar ? 1 : 0);
      this.iconoGrava.setAlpha(mostrar ? 1 : 0);
      this.textoGrava.setAlpha(mostrar ? 1 : 0);
    }

    // timer
    if (!this.isVersus) {
      if (!gs.gameOver) {
        this.tiempoRestante -= this.game.loop.delta / 1000;
        if (this.tiempoRestante < 0) this.tiempoRestante = 0;
        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = Math.floor(this.tiempoRestante % 60);
        const textoFormateado = `${minutos.toString().padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
        safeSetText(this.textoTimer, textoFormateado);
        safeSetColor(this.textoTimer, this.tiempoRestante <= 10 ? "#ff0000" : "#ffffffff");
      }
    } else {
      // Versus: mostrar tiempos por jugador desde la escena
      const tC = (gs && typeof gs.tiempoCeleste === 'number') ? Math.max(0, Math.floor(gs.tiempoCeleste)) : 180;
      const tN = (gs && typeof gs.tiempoNaranja === 'number') ? Math.max(0, Math.floor(gs.tiempoNaranja)) : 180;

      const format = (t) => {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      };

      safeSetText(this.textoTimerCeleste, format(tC));
      safeSetText(this.textoTimerNaranja, format(tN));
      safeSetColor(this.textoTimerCeleste, tC <= 10 ? "#ff0000" : "#00bfff");
      safeSetColor(this.textoTimerNaranja, tN <= 10 ? "#ff0000" : "#ff8c00");
    }

    if (this.tiempoRestante <= 0 && !this._gameOverLocal) {
      if (gs) gs.gameOver = true;
      this._gameOverLocal = true;

      this.add.rectangle(this.centerX, this.centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7).setDepth(7);
      this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, "TIEMPO FUERA", {
        fontFamily: "ActionComicsBlack", fontSize: "80px", color: "#ff0000", stroke: "#000000", strokeThickness: 8
      }).setOrigin(0.5).setDepth(7);
      if (this.textoTimer) this.textoTimer.destroy();
    }

    if (gs.Cemento) {
      if (this.BotonCementoF) this.BotonCementoF.setPosition(gs.Cemento.x, gs.Cemento.y - 75);
      if (this.BotonCementoK) this.BotonCementoK.setPosition(gs.Cemento.x, gs.Cemento.y - 75);
    }

    if (gs.winCondition) {
      gs.winCondition = false;
      if (gs) gs.gameOver = true;

      // Determinar texto y color según ganador (si existe)
      const winner = gs.winner || null;
      let titulo = "VICTORIA";
      let color = "#c5d300ff";
      if (winner) {
        titulo = `${winner.toUpperCase()}`;
        if (winner === "Celeste") color = "#00bfff"; // azul claro
        else if (winner === "Naranja") color = "#ff8c00"; // naranja
      }

      this.add.text(this.centerX, this.centerY - 150, titulo, {
        fontFamily: "ActionComicsBlack", fontSize: "80px", color: color, stroke: "#000000", strokeThickness: 8
      }).setOrigin(0.5).setDepth(7);

      const reiniciarButton = this.add.text(this.centerX, this.centerY + 50, 'REINICIAR', {
        fontFamily: 'ActionComicsBlack', fontSize: '40px', fill: '#fff', stroke: '#000', strokeThickness: 6, backgroundColor: '#007bff', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      reiniciarButton.on('pointerdown', () => {
        const targetSceneKey = (gs && gs.sys && gs.sys.settings && gs.sys.settings.key) || this.targetSceneKey || (this.isVersus ? 'gameversus' : 'game');

        this.tweens.add({
          targets: this.PantallaNegra,
          y: 540,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            this.time.delayedCall(500, () => {
              // Parar HUD primero para evitar conflictos de input/usuarios duplicados
              try { this.scene.stop('HUD'); } catch (e) {}
              // Asegurar que la escena objetivo esté parada antes de arrancarla
              try { this.scene.stop(targetSceneKey); } catch (e) {}
              // Iniciar la escena objetivo (su create() debe volver a lanzar el HUD)
              this.scene.start(targetSceneKey);
            });
          }
        });
      });

      const menuButton = this.add.text(this.centerX, this.centerY + 200, 'VOLVER AL MENU', {
        fontFamily: 'ActionComicsBlack', fontSize: '40px', fill: '#fff', stroke: '#000', strokeThickness: 6, backgroundColor: '#28a745', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();

      menuButton.on('pointerdown', () => {
        const targetSceneKey = (gs && gs.sys && gs.sys.settings && gs.sys.settings.key) || this.targetSceneKey || (this.isVersus ? 'gameversus' : 'game');
        this.tweens.add({
          targets: this.PantallaNegra,
          y: 540,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            this.time.delayedCall(500, () => {
              try { this.scene.stop(targetSceneKey); } catch (e) {}
              this.scene.start('preload');
            });
          }
        });
      });
    }
  }
}