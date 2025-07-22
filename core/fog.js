import { Color, GNode } from "@core";

/**
  * @typedef { 0 | 1 } FogType
  */
export const FogType = {
  /** @type { 0 } */  LINEAR: 0, 
  /** @type { 1 } */  EXPONENTIAL: 1, 
};

export class Fog extends GNode {
  /**
    * Current active fog instance.
    * @type { Fog } fog
    */
  static current = null;

  /**
    * Type of fog.
    */
  type = FogType.LINEAR;

  /**
    * Color of the fog.
    */
  color = Color.WHITE;

  /**
    * Density of the exponential fog or start distance for linear fog.
    */
  density = 2.0;

  /**
    * End distance for linear fog.
    */
  end = 100.0;

  /**
    * @param { FogType } type Type of fog (linear or exponential)
    * @param { Color } color Color of the fog
    * @param { number } density Density of the fog (for exponential fog) or start distance (for linear fog)
    */
  constructor(type = FogType.LINEAR, color = Color.WHITE, density = 2.0) {
    super();

    Object.assign(this, { type, color, density });
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
    material.setParameter('FOG_ENABLED', this.enabled);
    material.setParameter('FOG_COLOR', this.color);
    material.setParameter('FOG_DENSITY', this.density);
    material.setParameter('FOG_END', this.end);
    material.setParameter('FOG_TYPE', this.type);
  }
}
