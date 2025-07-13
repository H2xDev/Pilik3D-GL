import { Color } from "./color.js";
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
  }

  /** @type { DirectionalLight } */
  static current = null;

  process(dt, ctx) {
    DirectionalLight.current = this;
  }

  /**
    * Process a polygon with the directional light.
    *
    * @param { import("./camera3d.js").Camera3D } camera
    * @param { import("./polygon.js").Polygon } polygon
    */
  processPolygon(camera, polygon) {
    const worldNormal = polygon.normal.applyBasis(camera.transform.basis);
    const shining = Math.pow(Math.max(0, -worldNormal.dot(this.basis.forward)), 2);
    
    return polygon.color.mul(this.ambient)
      .add(this.color.mul(shining * this.energy))
  }
}
