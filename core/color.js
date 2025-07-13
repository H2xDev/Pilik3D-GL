import { Vec3 } from './vec3.js';

export class Color {
  static get WHITE() {
    return new Color(1, 1, 1);
  }

  static get RED() {
    return new Color(1, 0, 0);
  }

  static get GREEN() {
    return new Color(0, 1, 0);
  }

  static get BLUE() {
    return new Color(0, 0, 1);
  }
  
  static get BLACK() {
    return new Color(0, 0, 0);
  }

  static get YELLOW() {
    return new Color(1, 1, 0);
  }

  static get CYAN() {
    return new Color(0, 1, 1);
  }

  static get MAGENTA() {
    return new Color(1, 0, 1);
  }

  static get ORANGE() {
    return new Color(1, 0.5, 0);
  }

  r = 0;
  g = 0;
  b = 0;

  /**
    * @param { string | number | Vec3 } r - Hex color string (e.g., "#RRGGBB" or "RRGGBB"), a number, or a Vec3.
    * @param { number } [g] - Green component (0-1).
    * @param { number } [b] - Blue component (0-1).
    */
  constructor(r = 1, g = 1, b = 1) {
    if (typeof r === 'string') {
      r = r.replace('#', '');

      if (r.length === 3) {
        r = r.split('').map(c => c + c).join('');
      }

      if (r.length !== 6) {
        throw new Error('Invalid hex color format. Use #RRGGBB or RRGGBB.');
      }

      this.r = parseInt(r.slice(0, 2), 16) / 255;
      this.g = parseInt(r.slice(2, 4), 16) / 255;
      this.b = parseInt(r.slice(4, 6), 16) / 255;

      return this;
    }

    if (r instanceof Vec3) {
      this.r = r.x;
      this.g = r.y;
      this.b = r.z;
      return this;
    }

    this.r = Math.min(Math.max(r, 0), 1);
    this.g = Math.min(Math.max(g ?? r, 0), 1);
    this.b = Math.min(Math.max(b ?? r, 0), 1);
  }

  /** @param { Color } color */
  add(color) {
    return new Color(
      Math.min(this.r + color.r, 1),
      Math.min(this.g + color.g, 1),
      Math.min(this.b + color.b, 1)
    );
  }

  /** @param { Color | number } scalar */
  mul(scalar) {
    if (scalar instanceof Color) {
      return Object.assign(new Color(), {
        r: Math.min(this.r * scalar.r, 1),
        g: Math.min(this.g * scalar.g, 1),
        b: Math.min(this.b * scalar.b, 1)
      });
    }

    return Object.assign(new Color(), {
      r: Math.min(this.r * scalar, 1),
      g: Math.min(this.g * scalar, 1),
      b: Math.min(this.b * scalar, 1)
    });
  }

  /** @param { Vec3 | number } scalar */
  sub(color) {
    return Object.assign(new Color(), {
      r: Math.max(this.r - color.r, 0),
      g: Math.max(this.g - color.g, 0),
      b: Math.max(this.b - color.b, 0)
    });
  }

  invert() {
    return new Color(
      1 - this.r,
      1 - this.g,
      1 - this.b
    );
  }

  /** 
   * @param { Color } color 
   * @param { number } t - Interpolation factor (0 to 1).
   */
  mix(color, t) {
    return new Color(
      this.r * (1 - t) + color.r * t,
      this.g * (1 - t) + color.g * t,
      this.b * (1 - t) + color.b * t
    );
  }

  hueRotate(degrees) {
    const radians = degrees * (Math.PI / 180);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const r = this.r;
    const g = this.g;
    const b = this.b;

    this.r = r * (cos + (1 - cos) / 3) + g * ((1 - cos) / 3 - sin) + b * ((1 - cos) / 3 + sin);
    this.g = r * ((1 - cos) / 3 + sin) + g * (cos + (1 - cos) / 3) + b * ((1 - cos) / 3 - sin);
    this.b = r * ((1 - cos) / 3 - sin) + g * ((1 - cos) / 3 + sin) + b * (cos + (1 - cos) / 3);

    return this;
  }

  assign(ctx) {
    ctx.fillStyle = `rgba(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)}, 1)`;
    ctx.strokeStyle = `rgba(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)}, 1)`;
  }

  clone() {
    return new Color(this.r, this.g, this.b);
  }

  toString() {
    return `rgba(${Math.round(this.r * 255)}, ${Math.round(this.g * 255)}, ${Math.round(this.b * 255)}, 1)`;
  }

  toArray() {
    return [this.r, this.g, this.b];
  }
}
