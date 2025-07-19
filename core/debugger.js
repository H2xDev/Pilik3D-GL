import { gl } from "./gl.js";
import { til } from "./utils.js";

export const GameDebugger = new class {
  elements = {};
  container = document.createElement('div');

  constructor() {
    til(() => gl.canvas?.parentNode).then(() => {
      gl.canvas.parentNode.appendChild(this.container);
    });

    this.container.className = 'debugger';
    this.container.style.position = 'absolute';

    setInterval(this.update.bind(this), 100);
  }

  addDebugInfo(name, getter) {
    const el = document.createElement('div');
    el.className = 'debug-label';
    this.elements[name] = {
      el,
      getter,
    }
    this.container.appendChild(el);
  }

  color(value) {
    this.container.style.color = value;
  }

  update() {
    this.container.style.cssText = gl.canvas.style.cssText;
    this.container.style.zIndex = '1000';
    this.container.style.background = 'none';
    this.container.style.pointerEvents = 'none';

    for (const [name, { el, getter }] of Object.entries(this.elements)) {
      let value = getter();
      value = value.toString?.() || value;

      el.textContent = `${name}: ${value}`;
    }
  }
}
