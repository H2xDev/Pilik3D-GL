import { Vec3 } from './vec3.js';

export class Basis {
  x = new Vec3(1, 0, 0);
  y = new Vec3(0, 1, 0);
  z = new Vec3(0, 0, 1);

  /**
   * Creates a new Basis object.
   * @param { Vec3 } x The x-axis vector.
   * @param { Vec3 } y The y-axis vector.
   * @param { Vec3 } z The z-axis vector.
   */
  constructor(
    x = new Vec3(1, 0, 0),
    y = new Vec3(0, 1, 0),
    z = new Vec3(0, 0, 1)
  ) {
    Object.assign(this, { x, y, z });
  }

  static get IDENTITY() {
    return new Basis(
      new Vec3(1, 0, 0),
      new Vec3(0, 1, 0),
      new Vec3(0, 0, 1)
    );
  }

  get inverse() {
    return new Basis(
      new Vec3(this.x.x, this.y.x, this.z.x),
      new Vec3(this.x.y, this.y.y, this.z.y),
      new Vec3(this.x.z, this.y.z, this.z.z)
    );
  }

  get forward() {
    return this.z.mul(-1);
  }

  set forward(value) {
    this.z = value.normalized.mul(-1);
    this.x = this.y.cross(this.z).normalized;
    this.y = this.z.cross(this.x).normalized;
  }

  get up() {
    return this.y;
  }

  set up(value) {
    const up = value.normalized;
    const forward = this.forward;
    const x = up.cross(forward).normalized;
    const z = x.cross(up).normalized;
  
    this.x = x;
    this.y = up;
    this.z = z.mul(-1);
  }

  get right() {
    return this.x
  }

  get down() {
    return this.y.mul(-1);
  }

  get left() {
    return this.x.mul(-1);
  }

  get backward() {
    return this.z;
  }

  get roll() {
    return this.getEulerRelativeToForward().roll;
  }

  get pitch() {
    return this.getEulerRelativeToForward().pitch;
  }

  get yaw() {
    return this.getEulerRelativeToForward().yaw;
  }

  /**
   * Rotates the basis around a given axis by a specified angle.
   * @param {Vec3} axis - The axis to rotate around.
   * @param {number} angle - The angle in radians to rotate.
   */
  rotate(axis, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
  
    const x = axis.x;
    const y = axis.y;
    const z = axis.z;
  
    // 3x3 rotation matrix (row-major)
    const rotationMatrix = [
      t * x * x + c,     t * x * y - s * z, t * x * z + s * y,
      t * y * x + s * z, t * y * y + c,     t * y * z - s * x,
      t * z * x - s * y, t * z * y + s * x, t * z * z + c
    ];
  
    // Сохраняем старые значения
    const oldX = this.x;
    const oldY = this.y;
    const oldZ = this.z;
  
    this.x = oldX.mul(rotationMatrix[0]).add(oldY.mul(rotationMatrix[1])).add(oldZ.mul(rotationMatrix[2]));
    this.y = oldX.mul(rotationMatrix[3]).add(oldY.mul(rotationMatrix[4])).add(oldZ.mul(rotationMatrix[5]));
    this.z = oldX.mul(rotationMatrix[6]).add(oldY.mul(rotationMatrix[7])).add(oldZ.mul(rotationMatrix[8]));
  
    return this;
  }

  rotated(axis, angle) {
    const basis = new Basis(this.x, this.y, this.z);
    return basis.rotate(axis, angle);
  }

  /**
    * Spherically interpolates between this basis and another basis.
    *
    * @param { Basis } basis
    * @param { number } t
    */
  slerp(basis, t) {
    const forward = this.forward.slerp(basis.forward, t).normalized;
    const up = this.up.slerp(basis.up, t).normalized;
  
    return new Basis().lookAt(forward, up);
  }

  /**
    * @param { Basis } other
    */
  multiply(other) {
    return new Basis(
      this.x.mul(other.x.x).add(this.y.mul(other.x.y)).add(this.z.mul(other.x.z)),
      this.x.mul(other.y.x).add(this.y.mul(other.y.y)).add(this.z.mul(other.y.z)),
      this.x.mul(other.z.x).add(this.y.mul(other.z.y)).add(this.z.mul(other.z.z))
    );
  }

  /**
    * @param { Vec3 } direction
    * @param { Vec3 } up
    */
  lookAt(direction, up = Vec3.UP) {
    const z = direction.normalized.mul(-1);
    const x = up.cross(z).normalized;
    const y = z.cross(x).normalized;

    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  /**
    * @param { Vec3 | number } scale
    */
  scaled(scale) {
    if (scale instanceof Vec3) return new Basis(
      this.x.mul(scale.x),
      this.y.mul(scale.y),
      this.z.mul(scale.z)
    );

    return new Basis(
      this.x.mul(scale),
      this.y.mul(scale),
      this.z.mul(scale)
    );
  }

  toString() {
    return `Basis(
      x: ${this.x.toString()},
      y: ${this.y.toString()},
      z: ${this.z.toString()}
    )`;
  }

  getEulerRelativeToForward(referenceUp = Vec3.UP) {
    const forward = this.forward.normalized;
    const up = this.up.normalized;
  
    const pitch = Math.asin(-forward.y); // forward.y = sin(pitch)
    const yaw = Math.atan2(forward.x, -forward.z);
  
    const projUp = referenceUp.sub(forward.mul(referenceUp.dot(forward))).normalized;
    const currUp = up.sub(forward.mul(up.dot(forward))).normalized;
    const dot = projUp.dot(currUp);
    const cross = forward.dot(projUp.cross(currUp));
    const roll = Math.atan2(cross, dot);
  
    return { pitch, yaw, roll };
  }

  /**
    * @param { Vec3 } direction
    */
  static lookAt(direction, up = Vec3.UP) {
    const basis = new Basis();
    basis.lookAt(direction, up);
    return basis;
  }
}
