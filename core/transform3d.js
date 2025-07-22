import { Basis, Vec3 } from "@core";

export class Transform3D {
  basis = Basis.IDENTITY;
  position = Vec3.ZERO;
  scale = Vec3.ONE;

  static get IDENTITY() {
    return new Transform3D(Basis.IDENTITY, Vec3.ZERO);
  }

  constructor(basis = Basis.IDENTITY, position = Vec3.ZERO, scale = Vec3.ONE) {
    Object.assign(this, { basis, position, scale });
  }

  get inverse() {
    const inverseBasis = this.basis.inverse;
    const inversePosition = this.position.mul(-1).applyBasis(inverseBasis);
    return new Transform3D(inverseBasis, inversePosition);
  }

  get isDeterminantZero() {
    const { x, y, z } = this.basis;
    return (
      x.x * (y.y * z.z - y.z * z.y) -
      x.y * (y.x * z.z - y.z * z.x) +
      x.z * (y.x * z.y - y.y * z.x) === 0
    );
  }

  toMat4() {
    const b = this.basis.scaled(this.scale);

    return [
      ...b.x.toArray(), 0.0,
      ...b.y.toArray(), 0.0,
      ...b.z.toArray(), 0.0,
      ...this.position.toArray(), 1.0,
    ];
  }
  
  /**
    * Applies one Transform3D to another.
    * @param { Transform3D } other
    */
  multiply(other) {
    const newBasis = this.basis.multiply(other.basis);
    const newPosition = this.basis.x.mul(other.position.x)
      .add(this.basis.y.mul(other.position.y))
      .add(this.basis.z.mul(other.position.z))
      .add(this.position);
    const newScale = this.scale.mul(other.scale);
  
    return new Transform3D(newBasis, newPosition, newScale);
  }
}
