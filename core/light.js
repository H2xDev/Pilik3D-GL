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
}
