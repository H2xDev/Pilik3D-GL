import { Camera3D } from './camera3d.js';
import { Color } from './color.js';
import { DirectionalLight } from './directionalLight.js';
import { ShaderMaterial, vertex, fragment } from './shaderMaterial.js';
import { Vec3 } from './vec3.js';
import { Fog } from './fog.js';
import { BASE_VERTEX_SHADER, BASE_FRAGMENT_SHADER } from './shaders/base.js';

/**
  * Defines a spatial material with customizable vertex and fragment shaders.
  */
export const defineSpatialMaterial = () => ({
  v: BASE_VERTEX_SHADER,
  f: BASE_FRAGMENT_SHADER,

  /**
   * @param {string} glsl - The GLSL vertex shader code to inject.
   * @returns {typeof this} Returns the shader material instance for chaining.
   */
  vertex(glsl) {
    if (!glsl) return this;
    this.v = this.v.replace('void vertex() {}', glsl);

    // Don't allow chaining after this method
    delete this.vertex;
    return this;
  },

  /**
   * @param {string} glsl - The GLSL fragment shader code to inject.
   * @returns {typeof this} Returns the shader material instance for chaining.
   */
  fragment(glsl) {
    if (!glsl) return this;
    this.f = this.f.replace('void fragment(inout vec3 color) {}', glsl);
    // Don't allow chaining after this method
    delete this.fragment;
    return this;
  },

  compile() {
    return class extends ShaderMaterial(vertex(this.v), fragment(this.f)) {
      params = {
        albedo_color: Color.WHITE,
        specular: false,
        specular_power: 32.0,
      }

      /**
        * @param {Partial<typeof this.params>} params - Material parameters
        */
      constructor(params = {}) {
        super();
        Object.assign(this.params, params);
      }

      applyUniforms() {
        const { current: camera } = Camera3D;
        const { current: sun } = DirectionalLight;
        const { current: fog } = Fog;

        if (!camera) {
          console.warn("No active camera found. Skipping uniform application.");
          return;
        }

        this.setParameter('INV_CAMERA', camera.globalTransform.inverse.toMat4());
        this.setParameter('PROJECTION', camera.projectionMatrix);

        // Directional light parameters
        this.setParameter('SUN_COLOR', sun ? sun.color : Color.WHITE);
        this.setParameter('SUN_DIRECTION', sun ? sun.transform.basis.forward : Vec3.DOWN);
        this.setParameter('SUN_AMBIENT', sun ? sun.ambient : Color.BLACK);

        // Set fog parameters
        this.setParameter('FOG_COLOR', fog ? fog.color : Color.WHITE);
        this.setParameter('FOG_DENSITY', fog ? fog.density : 0.0);

        super.applyUniforms();
      }
    }
  }
})

export const BaseMaterial = defineSpatialMaterial().compile();
