import { Color } from "./color.js";
import { Vec3 } from "./vec3.js";

export class Polygon {
  v1 = Vec3.ZERO;
  v2 = Vec3.ZERO;
  v3 = Vec3.ZERO;
  color = Color.WHITE;
  normal = Vec3.UP;
  geometryNode = null;

  get center() {
    return new Vec3(
      (this.v1.x + this.v2.x + this.v3.x) / 3,
      (this.v1.y + this.v2.y + this.v3.y) / 3,
      (this.v1.z + this.v2.z + this.v3.z) / 3
    );
  }

  toVec3Array() {
    return [this.v1, this.v2, this.v3];
  }

  normalsToArray() {
    return this.normal.toArray()
      .concat(this.normal.toArray())
      .concat(this.normal.toArray());
  }

  clone() {
    return Object.assign(new Polygon(), {
      v1: this.v1.clone(),
      v2: this.v2.clone(),
      v3: this.v3.clone(),
      normal: this.normal.clone(),
      color: this.color.clone(),
      geometryNode: this.geometryNode,
    });
  }

  recalculateNormal() {
    const edge1 = this.v2.sub(this.v1);
    const edge2 = this.v3.sub(this.v1);
    this.normal = edge1.cross(edge2).normalized.inverted;
  }

  /** @param { import('./transform3d').Transform3D } transform */
  applyTransform(transform) {
    return Object.assign(new Polygon(), {
      v1: this.v1.applyTransform(transform),
      v2: this.v2.applyTransform(transform),
      v3: this.v3.applyTransform(transform),
      normal: this.normal.applyBasis(transform.basis).normalized,
      color: this.color,
      geometryNode: this.geometryNode,
    });
  }
}
