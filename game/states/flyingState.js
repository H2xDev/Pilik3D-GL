import { State, Camera3D, Vec3 } from '@core';
import { MOVE_TO_CAR_STATE } from './moveToCarState.js';
import { SongsManager } from '../songsManager.js';

export const FLY_HEIGHT = 10.0;
export const LOOK_AHEAD_DISTANCE = 20.0;

export const FLYING_STATE = new class FlyingState extends State {
  camera= Object.assign(new Camera3D(), {
    fov: 20,
  })

  cameraz = 0;

  /** @type { import('../index.js').Game } */
  scene = null;

  async begin() {
    this.camera.makeCurrent();
    this.scene.addChild(this.camera);
    const splash = document.querySelector('.splash');

    const handleStart = (e) => {
      this.scene.stateMachine.setState(MOVE_TO_CAR_STATE);
      SongsManager.player.playVideo();
    }
    splash.addEventListener('click', handleStart, { once: true });
    this.camera.position = this.scene.terrain.getRoad(this.cameraz).add(new Vec3(0, FLY_HEIGHT, 0));
    this.camera.basis.lookAt(this.scene.terrain.getRoad(this.cameraz - LOOK_AHEAD_DISTANCE).sub(this.camera.position), Vec3.UP);
  }

  end() {
    this.scene.removeChild(this.camera);
  }

  process(dt) {
    const { terrain } = this.scene;
    this.cameraz -= dt;

    this.camera.position = terrain.getRoad(this.cameraz).add(new Vec3(0, FLY_HEIGHT, 0));
    this.camera.basis.lookAt(this.scene.terrain.getRoad(this.cameraz - LOOK_AHEAD_DISTANCE).sub(this.camera.position), Vec3.UP);
  }
}
