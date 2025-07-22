import { 
  GNode3D, 
  Vec3,
  Vec2,
  canvas,
  DEG_TO_RAD,
} from "@core/index.js";

export class Camera3D extends GNode3D {
  /** @type { Camera3D } */
  static current = null;

  fov = 50;
  far = 1000;
  near = 0.1;

  constructor() {
    super();
    this.makeCurrent();
  }

  makeCurrent() {
    Camera3D.current = this;
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

  isPointAhead(point) {
    return true;
  }

  /**
    * Converts a 3D point to a 2D screen position.
    * @param { Vec3 } point - The 3D point to convert.
    * @returns { Vec2 | null }
    */
  toScreenPosition(point) {
    const viewPos = point.applyTransform(this.globalTransform.inverse);
    const perspective = 1 / Math.tan(this.fov * DEG_TO_RAD / 2);
    const aspect = canvas.width / canvas.height;
  
    if (viewPos.z >= 0) return null;

    const x = viewPos.x / viewPos.z * perspective / aspect;
    const y = viewPos.y / viewPos.z * perspective;
  
    return new Vec2(-x, y).mul(0.5).add(0.5);
  }

  get projectionMatrix() {
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
}
