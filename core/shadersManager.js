export const ShadersManager = new class ShadersManager {
  /**
    * @type { Record<string, string> }
    */
  shaders = {};

  constructor() {
    this.shaders = {};
  }

  /**
    * Preloads shaders from the given paths.
    * @param { string[] } shaderPaths
    */
  async preload(...shaderPaths) {
    const promises = shaderPaths.map(async path => {
      const source = await fetch(path).then(response => response.text());
      this.shaders[path] = source;
    });

    return Promise.all(promises);
  }

  /**
    * @param { string } path
    */
  import(path) {
    if (path in this.shaders) {
      return this.shaders[path];
    }

    return '';
  }
}
