import { 
  GNode3D, 
  Vec3,
  Vec2,
  Mat4,
  Mesh,
  gl,
  canvas,
  orthographicProjection,
  DEG_TO_RAD,
} from "@core/index.js";

export class Camera3D extends GNode3D {
  /** @type { Camera3D } */
  static current = null;

  fov = 50;
  far = 1000;
  near = 0.1;
  /** @type { "orthographic" | "perspective" } */
  projectionType = "perspective";
  screenSize = new Vec2(canvas.width, canvas.height);

  get projection() {
    return this[this.projectionType + "Projection"];
  }

  constructor() {
    super();
    this.makeCurrent();
  }

  makeCurrent() {
    this.constructor.current = this;
  }

  process(deltaTime) {
    if (this.constructor.current !== this) return;

    this.scene.renderScene(node => {
      if (!(node instanceof Mesh)) return;
      if (!node.enabled) return;

      const material = node.material;
      gl.useProgram(material.program);
      gl.viewport(0, 0, canvas.width, canvas.height);
      material.applyUniforms();
      material.setParameter("CAMERA_VIEW_MATRIX", this.globalTransform.inverse.toMat4());
      material.setParameter("PROJECTION", this.projection);

      return material;
    });
  }

  /**
    * @param { Vec3 } point
    */
  isPointInsideScreen(point) {
    const screenPosition = this.toScreenPosition(point);
    if (!screenPosition) return false;

    const { x, y } = screenPosition;

    return (
      x > -1 && x < 1 &&
      y > -1 && y < 1
    );
  }

  /**
    * Converts a 3D point to a 2D screen position.
    * @param { Vec3 } point - The 3D point to convert.
    * @returns { Vec2 | null }
    */
  toScreenPosition(point) {
    const viewProj = Mat4.multiply(this.projection, this.globalTransform.inverse.toMat4());
    const p = Mat4.transformVec3(viewProj, point); // возвращает уже делённые x/w, y/w, z/w
  
    // p в NDC: от -1 до 1
    // если вне дальности камеры, можно отбросить
    if (p.z < -1 || p.z > 1) return null;
  
    const screenX = (p.x * 0.5 + 0.5);
    const screenY = (-p.y * 0.5 + 0.5);
  
    return new Vec2(screenX, screenY);
  }

  get perspectiveProjection() {
    const aspect = canvas.width / canvas.height;
    const f = 1.0 / Math.tan(this.fov * DEG_TO_RAD / 2);
    const nf = 1 / (this.near - this.far);

    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (this.far + this.near) * nf, -1,
      0, 0, (2 * this.far * this.near) * nf, 0
    ];
  }

  get orthographicProjection() {
    const { x, y } = this.screenSize.mul(0.5);

    return orthographicProjection(
      -x, x,
      -y, y,
      this.near, this.far
    );
  }
}
