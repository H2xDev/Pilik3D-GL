import { Camera3D, canvas, Vec2, Vec3 } from '@core';

export class AABB {
  size = Vec3.ONE;
  center = Vec3.ZERO;
  debug_ = false;
  dom = document.createElement('div');
  logged = false;

  get debug() {
    return this.debug_;
  }

  set debug(value) {
    this.debug_ = value;
    if (value) {
      document.body.appendChild(this.dom);
    } else {
      this.dom.parentNode.removeChild(this.dom);
    }
  }

  /**
    * Creates an Axis-Aligned Bounding Box (AABB).
    */
  constructor(size, center) {
    Object.assign(this, { size, center });

    Object.assign(this.dom.style, {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '32px',
      height: '32px',
      border: '1px solid green',
      pointerEvents: 'none',
    });

    if (this.debug) {
      document.body.appendChild(this.dom);
    }
  }

  get vertices() {
    const halfSize = this.size.mul(0.5);
    return [
      new Vec3(this.center.x - halfSize.x, this.center.y - halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y - halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y + halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y + halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y - halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y - halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y + halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y + halfSize.y, this.center.z + halfSize.z)
    ];
  }

  isInCamera(transform, camera = Camera3D.current) {
    let smin = new Vec2(Infinity, Infinity);
    let smax = new Vec2(-Infinity, -Infinity);
    let hasAnyInFront = false;

    for (const vertex of this.vertices) {
      let screenPos = camera.toScreenPosition(vertex.applyTransform(transform));
      if (!screenPos) continue;

      hasAnyInFront = true;
  
      smin.x = Math.min(smin.x, screenPos.x);
      smin.y = Math.min(smin.y, screenPos.y);
      smax.x = Math.max(smax.x, screenPos.x);
      smax.y = Math.max(smax.y, screenPos.y);
    }
  
    if (!hasAnyInFront) return false;

    if (this.debug) {
      const { x: width, y: height } = camera.screenSize;

      this.dom.style.left = `${smin.x * width}px`;
      this.dom.style.top = `${smin.y * height}px`;
      this.dom.style.width = `${(smax.x - smin.x) * width}px`;
      this.dom.style.height = `${(smax.y - smin.y) * height}px`;
    }
  
    return smax.x >= 0.0 && smin.x <= 1.0 &&
      smax.y >= 0.0 && smin.y <= 1.0;
  }
}

