import { Camera3D, GNode, GNode3D } from "@core/index.js";

export class Scene extends GNode3D {
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

  /**
    * @template { Camera3D } TCamera
    * @param { (node?: GNode) => import("./mesh").Material | void } beforeEach - Function to call before rendering each node
    * @param { TCamera } camera Camera to use for rendering, defaults to the current camera
    * @param { GNode } node Delta time since last frame
    */
  renderScene(beforeEach = () => {}, camera, node = this) {
    if (!node || !node.enabled) return

    const material = beforeEach(node);
    if (node instanceof GNode3D && material) node.render(material, camera);

    node.children.forEach(child => this.renderScene(beforeEach, camera, child));
  }

  _render() {
    this.children.forEach(child => child instanceof GNode3D && child._render());
  }

  _process(dt) {
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
