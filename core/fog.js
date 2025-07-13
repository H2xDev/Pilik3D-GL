import { Color } from "./color.js";

export const FogType = {
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
};

export class Fog {
  static current = new Fog();
  type = FogType.LINEAR;
  color = Color.WHITE;
  density = 2.0; // For exponential fog, default density
  enabled = true; // Whether fog is enabled

  constructor(type = FogType.LINEAR, color = Color.WHITE) {
    if (Fog.current) return Fog.current;

    this.type = type;
    this.color = color;
  }


  /**
    * Process a polygon with the fog effect.
    * @param { import("./camera3d.js").Camera3D } camera in world space
    * @param { import("./polygon.js").Polygon } polygon in camera space
    * @param { Color } inColor
    */
  processPolygon(camera, polygon, inColor) {
    if (!this.enabled) return inColor;
    let fogFactor = Math.min(1.0, polygon.center.length / camera.far);

    if (this.type === FogType.EXPONENTIAL) {
      fogFactor = 1.0 - Math.exp(-this.density * fogFactor);
    }

    if (fogFactor <= 0) return inColor;

    return inColor.mix(this.color, fogFactor);
  }
}
