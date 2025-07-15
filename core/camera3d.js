import { 
  GNode3D, 
  DEG_TO_RAD,
  shaderPrograms,
  canvas,
  gl,
} from "./index.js";

export class Camera3D extends GNode3D {
  /** @type { Camera3D } */
  static current = null;

  fov = 50;
  far = 1000;
  near = 0.1;

  constructor() {
    super();
    this.makeCurrent();
  }

  process() {
    if (Camera3D.current !== this) return;
  }

  makeCurrent() {
    Camera3D.current = this;
  }

  get projectionMatrix() {
    const aspect = canvas.width / canvas.height;
    const f = 1.0 / Math.tan(this.fov * DEG_TO_RAD / 2);
    const nf = 1 / (this.near - this.far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (this.far + this.near) * nf, -1,
      0, 0, (2 * this.far * this.near) * nf, 0
    ];
  }
}
