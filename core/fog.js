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
}
