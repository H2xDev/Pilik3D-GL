import { Color } from "./color.js";
import { GNode } from "./gnode.js";

export const FogType = {
  LINEAR: 0,
  EXPONENTIAL: 1,
};

export class Fog extends GNode {
  /**
    * Current active fog instance.
    * @type { Fog } fog
    */
  static current = null;

  type = FogType.LINEAR;
  color = Color.WHITE;
  density = 2.0; // For exponential fog, default density
  enabled = true; // Whether fog is enabled

  constructor(type = FogType.LINEAR, color = Color.WHITE, density = 2.0) {
    super();

    if (Fog.current) return Fog.current;

    Object.assign(this, {
      type,
      color,
      density,
    });

    Fog.current = this;
  }

  process(dt) {
    Fog.current = this;
  }

  /**
    * This method called from a materrial. Just applying uniforms
    *
    * @param { InstanceType<ReturnType<import('./shaderMaterial.js').ShaderMaterial>> } material Material to apply fog parameters to
    */
  assignParameters(material) {
    material.setParameter('FOG_COLOR', this.color);
    material.setParameter('FOG_DENSITY', this.density);
    material.setParameter('FOG_TYPE', this.type);
  }
}
