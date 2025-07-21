import { Camera3D, Color, DirectionalLight, ShaderMaterial, vertex, fragment, Vec3, Fog, gl, Transform3D } from './index.js';
import { BASE_VERTEX_SHADER, BASE_FRAGMENT_SHADER } from './shaders/base.js';

/**
  * Injects values from the definitions into the shader's source code.
  *
  * @param { string } shaderSource
  * @param { Record<string, string | number> } definitions
  */
const injectDefinitions = (shaderSource, definitions) => {
  Object.keys(definitions).forEach(key => {
    let value = definitions[key];

    if (key.toLowerCase().startsWith('float_')) {
      value = value.toFixed(6)
        .replace(/(\.(.+[1-9])(0+)$/g, '$1')
        .replace(/\.0+$/g, '.0');
    }
    
    shaderSource = shaderSource.replaceAll('#inject ' + key, definitions[key]);
  });

  return shaderSource;
}

/**
  * Defines a spatial material with customizable vertex and fragment shaders.
  */
export const defineSpatialMaterial = (v = 'void vertex() {}', f = 'void fragment(inout vec3 color) {}', injections = {}) => {
  v = BASE_VERTEX_SHADER.replace('void vertex() {}', v);
  f = BASE_FRAGMENT_SHADER.replace('void fragment(inout vec3 color) {}', f);

  v = injectDefinitions(v, injections);
  f = injectDefinitions(f, injections);

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

      fog.assignParameters(this);

      super.applyUniforms();
    }
  }
};

export const BaseMaterial = defineSpatialMaterial();
