import { Vec3 } from "./vec3.js";

export class Vec2 {
  static get ZERO() {
    return new Vec2(0, 0);
  }

  static get ONE() {
    return new Vec2(1, 1);
  }

  static get UP() {
    return new Vec2(0, 1);
  }

  static get DOWN() {
    return new Vec2(0, -1);
  }

  static get LEFT() {
    return new Vec2(-1, 0);
  }

  static get RIGHT() {
    return new Vec2(1, 0);
  }

  /**
    * @param { Vec3 } v - A Vec3 instance.
    * @param { string } [axes='xy'] - A string indicating which axes to use from the Vec3.
    */
  static fromVec3(v, axes = 'xy') {
    const [component1, component2] = axes.split('');
    return new Vec2(v[component1], v[component2]);
  }

  static min(...vecs) {
    return vecs.reduce((minVec, currentVec) => {
      return new Vec2(
        Math.min(minVec.x, currentVec.x),
        Math.min(minVec.y, currentVec.y)
      );
    }, new Vec2(Infinity, Infinity));
  }

  static max(...vecs) {
    return vecs.reduce((maxVec, currentVec) => {
      return new Vec2(
        Math.max(maxVec.x, currentVec.x),
        Math.max(maxVec.y, currentVec.y)
      );
    }, new Vec2(-Infinity, -Infinity));
  }

  constructor(x = 0, y = x) {
    if (x instanceof Vec3) {
      y = x.z;
      x = x.x;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  get normalized() {
    const { length }  = this;
    if (length === 0) return new Vec2(0, 0);
    return new Vec2(this.x / length, this.y / length);
  }

  get length() {
    return Math.hypot(this.x, this.y);
  }

  toArray() {
    return [this.x, this.y];
  }

  add(v) {
    if (typeof v === 'number') {
      return new Vec2(this.x + v, this.y + v);
    }

    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    if (typeof v === 'number') {
      return new Vec2(this.x - v, this.y - v);
    }

    return new Vec2(this.x - v.x, this.y - v.y);
  }

  div(v) {
    if (typeof v === 'number') {
      return new Vec2(this.x / v, this.y / v);
    }

    return new Vec2(this.x / v.x, this.y / v.y);
  }

  mul(v) {
    if (typeof v === 'number') {
      return new Vec2(this.x * v, this.y * v);
    }

    return new Vec2(this.x * v.x, this.y * v.y);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return new Vec2(
      this.x * v.y - this.y * v.x,
      this.y * v.x - this.x * v.y
    );
  }

  floor() {
    return new Vec2(Math.floor(this.x), Math.floor(this.y));
  }

  ceil() {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
  }

  fract() {
    return new Vec2(this.x - Math.floor(this.x), this.y - Math.floor(this.y));
  }

  round() {
    return new Vec2(Math.round(this.x), Math.round(this.y));
  }

  lerp(v, t) {
    return new Vec2(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t
    );
  }

  slerp(v, t) {
    const dot = this.dot(v);
    if (dot < 0.0) {
      v = new Vec2(-v.x, -v.y);
    }
    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    if (sinTheta < 1e-6) {
      return this.lerp(v, t);
    }
    const a = Math.sin((1 - t) * theta) / sinTheta;
    const b = Math.sin(t * theta) / sinTheta;
    return new Vec2(
      a * this.x + b * v.x,
      a * this.y + b * v.y
    );
  }

  distanceTo(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  angleTo(v) {
    const dot = this.dot(v);
    const len1 = Math.hypot(this.x, this.y);
    const len2 = Math.hypot(v.x, v.y);
    if (len1 === 0 || len2 === 0) return 0;
    return Math.acos(dot / (len1 * len2));
  }

  toString() {
    return `Vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }
}
