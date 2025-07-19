import { assert } from "./utils.js";
import { UUID } from "./uuid.js";

export class GNode {
  static Events = {
    CHILD_ADDED: "childAdded",
    CHILD_REMOVED: "childRemoved",
  }

  id = UUID.generate();

  /** @type { GNode[] } */
  children = [];

  /** @type { GNode | null } */
  parent = null;

  /** @type { import('./scene.js').Scene | null } */
  scene = null;

  /** @type { string } */
  name = "GNode";

  enabled = true;

  meta = {};

  get root() {
    /** @type { GNode } */
    let node = this;
    while (node.parent) {
      node = node.parent;
    }
    return node;
  }

  /** @virtual */
  enterTree() {}
  
  /** @virtual */
  beforeDestroy() {}
  
  /** @virtual */
  gui(dt) {}

  /** @virtual */
  bg(dt) {}

  /** 
   * @param { number } dt - Delta time since last frame
   * @param { CanvasRenderingContext2D } ctx - Context for the current frame
   * @virtual 
   */
  process(dt) {}

  preprocess(dt) {}

  /**
   * For internal use only. Processes the node and its children.
   * @param { number } dt - Delta time since last frame
   * @param { CanvasRenderingContext2D } ctx - Context for the current frame
   */
  _process(dt) {
    if (!this.enabled) return;
    this.process(dt);
    this.children.forEach(child => child.preprocess(dt));
    this.children.forEach(child => child._process(dt));
  }

  /** 
    * @template { GNode } T
    * @param { T } child - The child node to add 
    * @returns { T } - The added child node
    */
  addChild(child, debug = false) {
    assert(child instanceof GNode, "Child must be an instance of GNode");

    child.parent = this;
    this.children.push(child);
    child.enterTree();
    child.children.forEach(c => c.enterTree());

    this.trigger(GNode.Events.CHILD_ADDED, child);
    this.root.trigger(GNode.Events.CHILD_ADDED, child);

    return child;
  }

  /**
    * @param { GNode } child - The child node to remove
    */
  removeChild(child) {
    assert(child instanceof GNode, "Child must be an instance of GNode");

    const index = this.children.indexOf(child);
    if (index !== -1) {
      child.children.forEach(c => {
        c.beforeDestroy?.();
        c.parent = null;
      });

      child.beforeDestroy?.();
      child.parent = null;

      this.children.splice(index, 1);
      this.trigger(GNode.Events.CHILD_REMOVED, child);
      this.root.trigger(GNode.Events.CHILD_REMOVED, child);
    }
  }

  /**
    * @template T
    * @param { T } nodeClass - The class of nodes to search for
    * @param { GNode } node - The node to start searching from, defaults to this node
    *
    * @returns { InstanceType<T>[] } - An array of nodes of the specified class
    */
  getChildrenByClass(nodeClass, node = this) {
    return node.children.reduce((acc, child) => {
      if (child instanceof nodeClass) {
        acc.push(child);
      }
      return acc.concat(this.getChildrenByClass(nodeClass, child));
    }, []);
  }

  /**
    * @param { string } eventName - The name of the event to listen for
    * @param { Function } callback - The function to call when the event is triggered
    * @param { boolean } [once=false] - If true, the listener will be removed after the first invocation
    */
  on(eventName, callback, once = false) {
    const handler = (event) => {
      callback(event.detail);
      if (once) unsub();
    }

    const unsub = () => {
      document.removeEventListener(`${this.id}:${eventName}`, handler);
    }

    document.addEventListener(`${this.id}:${eventName}`, handler);

    return unsub;
  }

  once(eventName, callback) {
    return this.on(eventName, callback, true);
  }

  /**
    * @param { string } eventName - The name of the event to trigger
    * @param { Object } [detail={}] - Additional data to pass with the event
    */
  trigger(eventName, detail = {}) {
    const event = new CustomEvent(`${this.id}:${eventName}`, { detail });
    document.dispatchEvent(event);
    return this;
  }

  triggerGlobal(eventName, detail = {}) {
    this.trigger(eventName, detail);
    if (this.parent) {
      this.parent.triggerGlobal(eventName, detail);
    }
  }
}

