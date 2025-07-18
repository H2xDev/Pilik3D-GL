export class Vec3 {
  x = 0;
  y = 0;
  z = 0;

  static get ZERO() {
    return new Vec3(0, 0, 0);
  }
  
  static get ONE() {
    return new Vec3(1, 1, 1);
  }

  static get UP() {
    return new Vec3(0, 1, 0);
  }

  static get DOWN() {
    return new Vec3(0, -1, 0);
  }

  static get LEFT() {
    return new Vec3(-1, 0, 0);
  }

  static get RIGHT() {
    return new Vec3(1, 0, 0);
  }

  static get FORWARD() {
    return new Vec3(0, 0, -1);
  }

  static get BACKWARD() {
    return new Vec3(0, 0, 1);
  }

  static get XZ() {
    return new Vec3(1, 0, 1);
  }

  static get XY() {
    return new Vec3(1, 1, 0);
  }

  static get YZ() {
    return new Vec3(0, 1, 1);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  get normalized() {
    const lenSq = this.x * this.x + this.y * this.y + this.z * this.z;
    if (lenSq === 0) return new Vec3(0, 0, 0);
    const invLen = 1 / Math.sqrt(lenSq);
    return new Vec3(this.x * invLen, this.y * invLen, this.z * invLen);
  }

  get inverted() {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  get xz() {
    return new Vec3(this.x, 0, this.z);
  }

  get xy() {
    return new Vec3(this.x, this.y, 0);
  }

  get yz() {
    return new Vec3(0, this.y, this.z);
  }

  constructor(x = 0, y = x, z = x) {
    Object.assign(this, { x, y, z });
  }

  add(v) {
    return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v) {
    return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
    * @param { Vec3 | number } scalar
    */
  mul(scalar) {
    if (scalar instanceof Vec3) {
      return new Vec3(this.x * scalar.x, this.y * scalar.y, this.z * scalar.z);
    }

    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
    * @param { Vec3 | number } scalar
    * @return { Vec3 }
    */
  div(scalar) {
    if (scalar instanceof Vec3) {
      return new Vec3(this.x / scalar.x, this.y / scalar.y, this.z / scalar.z);
    }

    return new Vec3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  floor() {
    return new Vec3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  ceil() {
    return new Vec3(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
  }

  round() {
    return new Vec3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
  }

  /**
    * Linearly interpolates between this vector and another vector.
    * @param { Vec3 } v - The target vector.
    * @param { number } t - The interpolation factor (0 to 1).
    */
  lerp(v, t) {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  /**
   * Spherical linear interpolation between this vector and another vector.
   * @param { Vec3 } v - The target vector.
   * @param { number } t - The interpolation factor (0 to 1).
   * @returns { Vec3 } The interpolated vector.
   */
  slerp(v, t) {
    let v0 = this.normalized;
    let v1 = v.normalized;
    let dot = v0.dot(v1);
  
    if (dot < 0) {
      v1 = v1.mul(-1);
      dot = -dot;
    }
  
    dot = Math.min(Math.max(dot, -1), 1);
  
    const theta = Math.acos(Math.max(-1, Math.min(dot, 1)));
    const sinTheta = Math.sin(theta);
  
    if (sinTheta < 1e-6) return v0.lerp(v1, t).normalized;
  
    const a = Math.sin((1 - t) * theta) / sinTheta;
    const b = Math.sin(t * theta) / sinTheta;
  
    return v0.mul(a).add(v1.mul(b));
  } 

  distanceTo(v) {
    return Math.sqrt(
      (this.x - v.x) ** 2 +
      (this.y - v.y) ** 2 +
      (this.z - v.z) ** 2
    );
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  /** @param { import('./transform3d.js').Transform3D } transform */
  applyTransform(transform) {
    return this.mul(transform.scale).applyBasis(transform.basis).add(transform.position);
  }

  /** @param { import('./basis.js').Basis } basis */
  applyBasis(basis) {
    return basis.x.mul(this.x)
      .add(basis.y.mul(this.y))
      .add(basis.z.mul(this.z));
  }

  toString() {
    return `Vec3(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }
}

