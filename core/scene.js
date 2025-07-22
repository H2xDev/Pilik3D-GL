import { Camera3D, DirectionalLight, GNode } from "@core";

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

  /**
    * @param { GNode } node - Delta time since last frame
    * @param { Function } beforeEach - Function to call before rendering each node
    */
  renderScene(beforeEach = () => {}, camera = Camera3D.current, node = this) {
    const material = beforeEach(node);
    if (!node.enabled) return
    if (material) {
      node.render(material, camera);
    }
    node.children.forEach(child => this.renderScene(beforeEach, camera, child));
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
