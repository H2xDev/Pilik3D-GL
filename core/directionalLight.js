import { Color, gl, GNode3D, Vec3, orhographicProjection } from './index.js';

export class DirectionalLight extends GNode3D {
  color = new Color(1, 1, 1);
  ambient = new Color(0.2, 0.2, 0.2);
  energy = 1;
  shadowSize = 1024;
  far = 1000;
  near = 0.1;
  projection = orhographicProjection(
    -this.shadowSize / 2, this.shadowSize / 2,
    -this.shadowSize / 2, this.shadowSize / 2,
    -this.far,            this.near,
  );
  frameBuffer = gl.createFramebuffer();

  constructor(color = Color.WHITE, direction = Vec3.DOWN, ambient = new Color(0.2, 0.2, 0.2)) {
    super();
    this.color = color;
    this.ambient = ambient;
    this.transform.basis.forward = direction.normalized;
    this.transform.position = this.transform.basis.forward.mul(this.far * 0.5);

    gl.clearColor(ambient.r, ambient.g, ambient.b, 1.0);
  }

  /** @type { DirectionalLight } */
  static current = null;

  process(dt, ctx) {
    DirectionalLight.current = this;
  }
}
