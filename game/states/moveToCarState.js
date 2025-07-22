import { State, Tween, Vec3, Basis } from '@core';
import { SongsManager } from '../songsManager.js';
import { FLY_HEIGHT, LOOK_AHEAD_DISTANCE } from './flyingState.js';

export const MOVE_TO_CAR_STATE = new class MoveToCarState extends State {
  /** @type { typeof import('../index.js').Game } */
  scene = null;
  camera = null;

  flyHeight = 7.0;

  /**
    * @param { typeof import('./flyingState').FLYING_STATE } prevState - Previous state
    */
  begin(prevState) {
    const { cameraz, camera } = prevState;

    this.cameraz = cameraz;
    this.camera = camera;
    this.scene.addChild(camera);
    this.scene.player.position = this.scene.terrain.getRoad(cameraz - 10.0);
    this.scene.player.model.basis.forward = this.scene.terrain.getRoadForward(cameraz - 10.0).normalized;
    this.scene.player.autopilot = true;

    const { terrain } = this.scene;
    const splash = document.querySelector('.splash');


    const startFov = this.camera.fov;
    splash.classList.add('fade-out');

    const startFogDensity = this.scene.fog.density;
    const targetFogDensity = 0.025;

    Tween.begin(5000, (t, dt) => {
      t = Tween.easeInOutQuart(t);
      this.cameraz -= dt;

      const posA = terrain.getRoad(this.cameraz).add(new Vec3(0, FLY_HEIGHT, 0));
      const basisA = Basis.lookAt(terrain.getRoad(this.cameraz - LOOK_AHEAD_DISTANCE).sub(posA), Vec3.UP);
      const posB = this.scene.camera.position;
      const basisB = this.scene.camera.basis;

      this.camera.basis = basisA.slerp(basisB, t);
      this.camera.position = posA.lerp(posB, t);
      this.camera.fov = startFov + (t * (this.scene.camera.fov - startFov));
      this.scene.player.volume = t;
      this.scene.fog.density = startFogDensity + (t * (targetFogDensity - startFogDensity));
    })
    .then(this.beginGame.bind(this))
    .then(() => SongsManager.showCurrentSong());
  }

  beginGame() {
    this.scene.player.controlsDisabled = false;
    this.scene.player.autopilot = false;
    this.scene.camera.makeCurrent();
  }

  end() {
    this.scene.removeChild(this.camera);
  }
}
