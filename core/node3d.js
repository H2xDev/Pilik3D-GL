import { GNode } from "./gnode.js";
import { Transform3D } from "./transform3d.js";

export class GNode3D extends GNode {
  /** @type { Transform3D } */
  transform = Transform3D.IDENTITY;

  get basis() {
    return this.transform.basis;
  }

  set basis(value) {
    this.transform.basis = value;
  }

  set scale(value) {
    this.transform.scale = value;
  }

  get scale() {
    return this.transform.scale;
  }

  get position() {
    return this.transform.position;
  }

  set position(value) {
    this.transform.position = value;
  }

  get globalPosition() {
    if (this.parent && this.parent instanceof GNode3D) {
      return this.transform.position.applyTransform(this.parent.globalTransform);
    }

    return this.transform.position;
  }

  set globalPosition(value) {
    if (this.parent && this.parent instanceof GNode3D) {
      this.transform.position = value.applyTransform(this.parent.globalTransform.inverse);
    } else {
      this.transform.position = value;
    }
  }

  get globalScale() {
    if (this.parent && this.parent instanceof GNode3D) {
      return this.parent.globalTransform.scale.mul(this.transform.scale);
    }

    return this.transform.basis.scale;
  }

  /**
    * @returns { Transform3D }
    */
  get globalTransform() {
    if (this.parent && this.parent instanceof GNode3D) {
      return this.parent.globalTransform.multiply(this.transform);
    }

    return this.transform;
  }

  /**
    * @virtual
    * Method for rendering the node.
    */
  render(...args) {}

  /**
    * For internal use only. Renders the node and its children.
    */
  _render() {
    if (!this.enabled) return;

    this.render();
    this.children.forEach(child => child instanceof GNode3D && child._render());
  }
}
