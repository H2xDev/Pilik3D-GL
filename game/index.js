import { Scene, Camera3D, Fog, Vec3, Color, DirectionalLight } from '@core/index.js';
import { Terrain } from './terrain.js';
import { Player } from './player.js';

export const Game = new class extends Scene {
  /** @type { Camera3D } */
  camera = this.addChild(new Camera3D());
  sun = this.addChild(new DirectionalLight(Color.WHITE, Vec3.DOWN.add(Vec3.LEFT).normalized, Color.MAGENTA.mul(0.25)));
  terrain = this.addChild(new Terrain());
  fog = Object.assign(new Fog(), {
    color: this.sun.ambient,
    density: 0.1,
  })
  player = this.addChild(new Player());
}
