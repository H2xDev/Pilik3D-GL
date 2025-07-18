import { Scene, Camera3D, Fog, Vec3, Color, DirectionalLight, FogType, GSound } from '@core/index.js';
import { Terrain } from './terrain.js';
import { Player } from './player.js';

const AMBIENT_COLOR = Color.ORANGE.mix(Color.WHITE, 0.5).mix(Color.BLUE.mul(1.5), 0.2);
const SUN_DIRECTION = Vec3.DOWN.add(Vec3.LEFT).normalized;

export const Game = new class extends Scene {
  camera    = this.addChild(new Camera3D());
  sun       = this.addChild(new DirectionalLight(Color.ORANGE, SUN_DIRECTION, AMBIENT_COLOR));
  terrain   = this.addChild(new Terrain());
  player    = this.addChild(new Player());
  wind = new GSound('/game/assets/wind.ogg', { loop: true, volume: 1.0 });
  fog = new Fog(FogType.EXPONENTIAL, this.sun.ambient, 0.025);

  begin() {
    window.addEventListener('keydown', (e) => {
      this.wind.play();
    }, { once: true });
  }

  process(dt) {
    this.wind.volume = 0.5 + Math.sin(this.time * 0.5) * 0.25;
  }
}
