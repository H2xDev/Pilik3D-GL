import { 
  Color,
  GNode3D, 
  AABB,
  Vec3, 
  Vec2,
  Camera3D, 
  ShaderMaterial, 
  gl, 
  fragment 
} from '@core';

import { BASE_DEPTH_FRAGMENT_SHADER } from './shaders/base.js';

export class DirectionalLight extends Camera3D {
  static programsCache = {};
  static fragmentShader = null;

  screenSize = new Vec2(100, 100);
  color = new Color(1, 1, 1);
  ambient = new Color(0.2, 0.2, 0.2);
  energy = 3;

  projectionType = "orthographic";
  far = 100;
  near = 0.001;
  bias = 0.001;
  frameBuffer = gl.createFramebuffer();
  shadowTexture = gl.createTexture();
  shadowTexelSize = 1 / 32;
  textureSize = window.innerWidth < 1340 ? 16384 / 6.0 : 16384;

  constructor(color = Color.WHITE, direction = Vec3.DOWN, ambient = new Color(0.2, 0.2, 0.2)) {
    super();
    this.color = color;
    this.ambient = ambient;
    this.transform.basis.forward = direction.normalized;

    gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT32F,
      this.textureSize, this.textureSize,
      0,
      gl.DEPTH_COMPONENT,
      gl.FLOAT,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.shadowTexture,
      0
    );

    gl.clearColor(this.ambient.r, this.ambient.g, this.ambient.b, 1.0);
  }

  /** @type { DirectionalLight } */
  static current = null;
  clearDepth() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.viewport(0, 0, this.textureSize, this.textureSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);
  }

  getMaterial(vertexShader) {
    DirectionalLight.fragmentShader ??= fragment(BASE_DEPTH_FRAGMENT_SHADER);
    const { programsCache, fragmentShader } = DirectionalLight;

    const { _id } = vertexShader;

    if (programsCache[_id]) {
      return programsCache[_id];
    }

    programsCache[_id] = new (ShaderMaterial(vertexShader, fragmentShader))();
    return programsCache[_id];
  }

  /**
    * This method called from a materrial. Just applying uniforms
    *
    * @param { InstanceType<ReturnType<import('./shaderMaterial.js').ShaderMaterial>> } material Material to apply fog parameters to
    */
  assignParameters(material) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowTexture);
    gl.uniform1i(material.uniforms['SUN_DEPTH_TEXTURE'], 0);

    material.setParameter('SUN_SHADOW_BIAS', this.bias);
    material.setParameter('SUN_COLOR', this.color);
    material.setParameter('SUN_DIRECTION', this.transform.basis.forward);
    material.setParameter('SUN_AMBIENT', this.ambient);
    material.setParameter('SUN_VIEW_MATRIX', this.globalTransform.inverse.toMat4());
    material.setParameter('SUN_PROJECTION', this.projection);
    material.setParameter('SUN_ENERGY', this.energy);
  }

  process(dt) {
    DirectionalLight.current = this;
    this.clearDepth();

    this.transform.position = Camera3D.current.transform.position
      .add(this.transform.basis.forward.mul(-this.far * 0.5));

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.viewport(0, 0, this.textureSize, this.textureSize);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    this.scene.renderScene((node) => {
      if (!(node instanceof GNode3D)) return;
      if (!node.material) return;


      const material = this.getMaterial(node.material.vertexShader);
      gl.useProgram(material.program);
      material.setParameter('CAMERA_VIEW_MATRIX', this.globalTransform.inverse.toMat4());
      material.setParameter('PROJECTION', this.projection);

      return material;
    }, this)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(null);
  }
}
