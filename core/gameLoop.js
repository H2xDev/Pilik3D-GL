import { canvas, gl } from "./gl.js";
import { Scene } from "./scene.js";
import { assert } from "./utils.js";

export class GameLoop {
  /** @type { GameLoop } */
  static instance = null;

	running = false;

	/** @type { Scene } */
	scene = null;

  constructor() {
    if (GameLoop.instance) {
      return GameLoop.instance;
    }

    GameLoop.instance = this;
  }

	lastTimestamp = 0;
	renderLoop(timestamp = 0) {
		const DELTA_TIME = (timestamp - (this.lastTimestamp || timestamp)) / 1000;

		this.lastTimestamp = timestamp;
		if (!this.running) return;
		assert(this.scene, "Scene is not set for rendering");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

		this.scene._process(DELTA_TIME);
		requestAnimationFrame(this.renderLoop.bind(this));
	}

  /**
    * Changes the current scene to the specified one.
    * @param { Scene } scene
    */
	async changeScene(scene) {
		if (this.scene) this.scene.exit();
		this.scene = scene;
		await this.scene.begin();

		return this;
	}

	setup(options = {}) {
		Object.assign(canvas, options);
		Object.assign(canvas.style, options.style || {});
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CW);
		return this;
	}

	mountTo(element) {
		element.appendChild(canvas);
		return this;
	}

	begin() {
		this.running = true;
		assert(gl, "Canvas 2D context is not available");
		this.renderLoop();
	}
}
