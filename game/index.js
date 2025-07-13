import { BoxGeometry } from '@core/importers/box.js';
import { Scene, Camera3D, loadShaderSource, BaseMaterial } from '@core/index.js';
import { Mesh } from '@core/mesh.js';

export const Game = new class extends Scene {
  /** @type { Camera3D } */
  camera = this.addChild(new Camera3D());

  async begin() {
    const carGeometry = new BoxGeometry();
    const material = new BaseMaterial();
    const mesh = new Mesh(carGeometry, material);
    console.log(mesh);
    this.addChild(mesh);
  }

  process(dt) {
    this.camera.position.z = 2;
  }
}
