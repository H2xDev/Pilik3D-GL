export const ResourceManager = new class ResourceManager {
  /**
   * @type { Record<string, { new (...args: any): any }> }
   */
  resources = {};

  constructor() {
    this.resources = {};
  }

  define(name, resource) {
    if (name in this.resources) {
      throw new Error(`Resource with name "${name}" already exists.`);
    }

    this.resources[name] = resource;
  }

  create(name, ...args) {
    if (!(name in this.resources)) {
      throw new Error(`Resource with name "${name}" does not exist.`);
    }

    const resource = this.resources[name];
    return new resource(...args);
  }
}
