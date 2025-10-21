export function applyFloating(sprite, {
  amplitude = 8,      // px movimiento vertical
  duration = 3000,    // ms para un ciclo (sube+baja)
  delay = 0,
  rotate = 0,         // grados máximos (ej: 3 -> +-3)
  scale = 0,          // variación de scale (ej: 0.03)
  ease = 'Sine.easeInOut'
} = {}) {
  if (!sprite || !sprite.scene) return null;
  const scene = sprite.scene;

  const base = {
    y: sprite.y,
    angle: sprite.angle || 0,
    scale: sprite.scaleX ?? sprite.scale ?? 1
  };

  const tweens = [];

  // movimiento vertical (hacia arriba base.y - amplitude)
  tweens.push(scene.tweens.add({
    targets: sprite,
    y: base.y - amplitude,
    duration,
    yoyo: true,
    repeat: -1,
    ease,
    delay
  }));

  // rotación leve (opcional)
  if (rotate) {
    tweens.push(scene.tweens.add({
      targets: sprite,
      angle: base.angle + rotate,
      duration: Math.round(duration / 2),
      yoyo: true,
      repeat: -1,
      ease,
      delay
    }));
  }

  // escala suave (opcional)
  if (scale) {
    tweens.push(scene.tweens.add({
      targets: sprite,
      scale: base.scale + scale,
      duration,
      yoyo: true,
      repeat: -1,
      ease,
      delay
    }));
  }

  return tweens;
}