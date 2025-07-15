import { Color } from "./color.js";
import { gl } from "./gl.js";
import { GNode3D } from "./node3d.js";
import { Vec3 } from "./vec3.js";

export class DirectionalLight extends GNode3D {
  color = new Color(1, 1, 1);
  ambient = new Color(0.2, 0.2, 0.2);
  energy = 1;

  constructor(color = Color.WHITE, direction = Vec3.DOWN, ambient = new Color(0.2, 0.2, 0.2)) {
    super();
    this.color = color;
    this.transform.basis.forward = direction.normalized;
    this.ambient = ambient;

    gl.clearColor(ambient.r, ambient.g, ambient.b, 1.0);
  }

  /** @type { DirectionalLight } */
  static current = null;

  process(dt, ctx) {
    DirectionalLight.current = this;
  }
}
