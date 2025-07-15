import { Scene, Camera3D, Fog, Vec3, Color, DirectionalLight } from '@core/index.js';
import { Terrain } from './terrain.js';
import { Player } from './player.js';

const AMBIENT_COLOR = Color.WHITE.sub(Color.ORANGE.mul(0.25));
const SUN_DIRECTION = Vec3.DOWN.add(Vec3.LEFT).normalized;

export const Game = new class extends Scene {
  /** @type { Camera3D } */
  camera = this.addChild(new Camera3D());
  sun = this.addChild(new DirectionalLight(Color.WHITE, SUN_DIRECTION, AMBIENT_COLOR));
  terrain = this.addChild(new Terrain());

  fog = Object.assign(new Fog(), {
    color: this.sun.ambient,
    density: 0.05,
  })
  player = this.addChild(new Player());

  begin() {
    // this.camera2.position = new Vec3(0, 50, 0);
    // this.camera2.basis.rotate(Vec3.LEFT, -Math.PI / 2);
  }
}
