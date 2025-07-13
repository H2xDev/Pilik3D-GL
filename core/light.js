import { GNode3D } from "./node3d.js";
import { Color } from "./color.js";

export class PointLight extends GNode3D {
  color = new Color(1, 1, 1);
  radius = 1;
  energy = 1;

  constructor(color = new Color(1, 0, 0), radius = 5, energy = 1) {
    super();
    this.color = color;
    this.radius = radius;
    this.energy = energy;
  }

  /**
    * @param { import("./camera3d").Camera3D } camera
    * @param { import("./polygon.js").Polygon } polygon
    * @param { Color } inColor
    */
  processPolygon(camera, polygon, inColor) {
    const lightPos = this.transform.position
      .applyTransform(this.globalTransform)
      .applyTransform(camera.transform.inverse);

    const delta1 = lightPos.sub(polygon.v1)
    const delta2 = lightPos.sub(polygon.v2);
    const delta3 = lightPos.sub(polygon.v3);
    const delta = lightPos.sub(polygon.center);

    const lightDir = delta.normalized;

    const distance = Math.min(delta1.length, delta2.length, delta3.length, delta.length);
    const percent = Math.max(0, 1 - distance / this.radius);

    if (percent <= 0) return inColor;

    const lightShining = Math.pow(Math.max(0, polygon.normal.dot(lightDir)), 1) * percent;

    return inColor.add(this.color.mul(lightShining * this.energy));
  }
}
