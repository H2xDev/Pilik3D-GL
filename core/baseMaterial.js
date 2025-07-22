import { 
  Camera3D, 
  Color, 
  DirectionalLight, 
  ShaderMaterial, 
  Vec3, 
  Fog, 
  ShadersManager,

  vertex, 
  fragment, 
  gl, 
} from './index.js';

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
        .replace(/(\..+[1-9])(0+)$/g, '$1')
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
  const BASE_VERTEX_SHADER = ShadersManager.import('/core/shaders/base.vert.glsl');
  const BASE_FRAGMENT_SHADER = ShadersManager.import('/core/shaders/base.frag.glsl');

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

      this.setParameter('CAMERA_VIEW_MATRIX', camera.globalTransform.inverse.toMat4());
      this.setParameter('PROJECTION', camera.projectionMatrix);

      sun && sun.assignParameters(this);
      fog && fog.assignParameters(this);

      super.applyUniforms();
    }
  }
};
