import { Camera3D, Color, DirectionalLight, ShaderMaterial, vertex, fragment, Vec3, Fog, gl, Transform3D } from './index.js';
import { BASE_DEPTH_FRAGMENT_SHADER, DEBUG_DEPTH_FRAGMENT_SHADER } from './shaders/base.js';
import { BASE_VERTEX_SHADER, BASE_FRAGMENT_SHADER } from './shaders/base.js';

const DEPTH_FRAGMENT_SHADER = fragment(BASE_DEPTH_FRAGMENT_SHADER);

/**
  * Defines a spatial material with customizable vertex and fragment shaders.
  */
export const defineSpatialMaterial = (v = 'void vertex() {}', f = 'void fragment(inout vec3 color) {}', injections = {}) => {
  v = BASE_VERTEX_SHADER.replace('void vertex() {}', v);
  f = BASE_FRAGMENT_SHADER.replace('void fragment(inout vec3 color) {}', f);

  Object.keys(injections).forEach(key => {
    v = v.replaceAll('#inject ' + key, injections[key]);
    f = f.replaceAll('#inject ' + key, injections[key]);
  });

  const VERTEX_SHADER = vertex(v);
  const FRAGMENT_SHADER = fragment(f);

  return class extends ShaderMaterial(VERTEX_SHADER, FRAGMENT_SHADER) {
    vertexShader = VERTEX_SHADER;
    fragmentShader = FRAGMENT_SHADER;

    params = {
      albedo_color: Color.WHITE,
      shading_hardness: 3.0,
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

      gl.useProgram(this.program);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sun.shadowTexture);
      gl.uniform1i(this.uniforms['SUN_DEPTH_TEXTURE'], 0);

      this.setParameter('CAMERA_VIEW_MATRIX', camera.globalTransform.inverse.toMat4());
      this.setParameter('PROJECTION', camera.projectionMatrix);

      // Directional light parameters
      this.setParameter('SUN_COLOR', sun ? sun.color : Color.WHITE);
      this.setParameter('SUN_DIRECTION', sun ? sun.transform.basis.forward : Vec3.DOWN);
      this.setParameter('SUN_AMBIENT', sun ? sun.ambient : Color.BLACK);
      this.setParameter('SUN_VIEW_MATRIX', sun.globalTransform.inverse.toMat4());
      this.setParameter('SUN_PROJECTION', sun.projection);
      this.setParameter('SUN_ENERGY', sun ? sun.energy : 1.0);

      // Set fog parameters
      this.setParameter('FOG_COLOR', fog ? fog.color : Color.WHITE);
      this.setParameter('FOG_DENSITY', fog ? fog.density : 0.0);
      this.setParameter('FOG_TYPE', fog ? fog.type : 0);

      super.applyUniforms();
    }
  }
};

export const BaseMaterial = defineSpatialMaterial();
