import { Color, gl, GNode3D, Vec3, orthographicProjection, Camera3D, nextPowerOfTwo, Mesh } from './index.js';

export class DirectionalLight extends GNode3D {
  color = new Color(1, 1, 1);
  ambient = new Color(0.2, 0.2, 0.2);
  energy = 4;

  shadowSize = 50;
  far = 100.0;
  near = 0.0001;
  frameBuffer = gl.createFramebuffer();
  shadowTexture = gl.createTexture();
  shadowTexelSize = 1 / 32;
  textureSize = window.innerWidth < 1340 ? 4096 : 16384;

  constructor(color = Color.WHITE, direction = Vec3.DOWN, ambient = new Color(0.2, 0.2, 0.2)) {
    super();
    this.color = color;
    this.ambient = ambient;
    this.transform.basis.forward = direction.normalized;

    const width = this.shadowSize / 2;
    const height = this.shadowSize / 2;
    this.projection = orthographicProjection(
      -width, width,
      -height, height,
      this.near, this.far,
    );

    console.log(this.textureSize);

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

  process(dt, ctx) {
    DirectionalLight.current = this;

    this.transform.position = Camera3D.current.transform.position
      .add(this.transform.basis.forward.mul(-this.far * 0.5));
  }
}
