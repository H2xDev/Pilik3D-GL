import { GNode } from "./gnode.js";

export class Scene extends GNode {
  /** @type { import('./camera3d.js').Camera3D | null } */
  camera = null;
  time = 0;

  /** 
    * @virtual 
    * @returns { Promise<void> | void }
    */
  begin() {}

  /** @virtual */
  exit() {}

  _process(dt) {
    this.bg(dt);
    this.children.forEach(child => child.bg?.(dt));

    super._process(dt);
    this.time += dt;
  }

  /**
    * Adds a child node to the scene.
    *
    * @template { GNode } T
    * @param { T } child
    * @returns { T }
    */
  addChild(child) {

    child.scene = this;
    child.children.forEach(c => c.scene = this);

    super.addChild(child);

    return child;
  }
}
