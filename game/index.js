import { Scene, Camera3D, Fog, Vec3, Color, DirectionalLight, FogType, GSound, StateMachine, State, Tween, Basis } from '@core/index.js';
import { Terrain } from './terrain.js';
import { Player } from './player.js';
import { til } from './utils.js';
import { SongsManager } from './songsManager.js';

const AMBIENT_COLOR = Color.BLUE.mix(Color.WHITE, 0.5).saturation(0.25);
const SUN_DIRECTION = Vec3.DOWN.add(Vec3.LEFT).normalized;
const FLY_HEIGHT = 7.0; // Height at which the camera flies
const LOOK_AHEAD_DISTANCE = 50.0; // Distance to look ahead on the road

const FLYING_STATE = new class FlyingState extends State {
  camera= Object.assign(new Camera3D(), {
    fov: 20,
  })

  cameraz = 0;

  /** @type { typeof Game } */
  scene

  begin() {
    this.camera.makeCurrent();
    this.scene.addChild(this.camera);
    const splash = document.querySelector('.splash');

    const handleStart = (e) => {
      this.scene.stateMachine.setState(MOVE_TO_CAR_STATE);
      SongsManager.player.playVideo();
    }
    splash.addEventListener('click', handleStart, { once: true });
  }

  end() {
    this.scene.removeChild(this.camera);
  }

  process(dt) {
    const { terrain } = this.scene;
    this.cameraz -= dt;

    this.camera.position = terrain.getRoad(this.cameraz).add(new Vec3(0, FLY_HEIGHT, 0));
    this.camera.basis.lookAt(terrain.getRoad(this.cameraz - LOOK_AHEAD_DISTANCE).sub(this.camera.position), Vec3.UP);
  }
}

const MOVE_TO_CAR_STATE = new class MoveToCarState extends State {
  /** @type { typeof Game } */
  scene = null;
  camera = null;

  flyHeight = 7.0;

  /**
    * @param { typeof FLYING_STATE } prevState
    */
  begin(prevState) {
    const { cameraz, camera } = prevState;

    this.cameraz = cameraz;
    this.camera = camera;
    // this.scene.addChild(camera);
    this.scene.player.position = this.scene.terrain.getRoad(cameraz - 100.0);
    this.scene.player.model.basis.forward = this.scene.terrain.getRoadForward(cameraz - 100.0).normalized;
    const { terrain } = this.scene;
    const splash = document.querySelector('.splash');


    const startFov = this.camera.fov;

    Tween.begin(5000, (t, dt) => {
      t = Tween.easeInOutQuart(t);
      this.cameraz -= dt;

      const posA = terrain.getRoad(this.cameraz).add(new Vec3(0, FLY_HEIGHT, 0));
      const basisA = Basis.lookAt(terrain.getRoad(this.cameraz - LOOK_AHEAD_DISTANCE).sub(posA), Vec3.UP);
      const posB = this.scene.camera.position;
      const basisB = this.scene.camera.basis;

      this.camera.basis = basisA.slerp(basisB, t);
      this.camera.position = posA.lerp(posB, t);
      this.camera.position.y = Math.max(this.camera.position.y, this.scene.terrain.getHeightAt(this.camera.position.x, this.camera.position.z) + 0.1);
      this.camera.fov = startFov + (t * (this.scene.camera.fov - startFov));
      this.scene.player.volume = t;
    })
    .then(() => this.scene.camera.makeCurrent())
    .then(() => {
      splash.classList.add('fade-out');
      SongsManager.showCurrentSong();
    })
    .then(this.scene.startGame.bind(this.scene));
  }

  end() {
    this.scene.removeChild(this.camera);
  }
}


export const Game = new class extends Scene {
  sun       = this.addChild(new DirectionalLight(Color.ORANGE.saturation(0.5), SUN_DIRECTION, AMBIENT_COLOR));
  terrain   = this.addChild(new Terrain());
  player    = this.addChild(new Player());
  camera    = this.addChild(new Camera3D());

  stateMachine = this.addChild(new StateMachine(FLYING_STATE));

  wind = new GSound('/game/assets/wind.ogg', { loop: true, volume: 1.0 });
  fog = new Fog(FogType.EXPONENTIAL, this.sun.ambient, 0.025);

  async begin() {
    await til(() => !!this.player.model);
    this.player.position = this.terrain.getRoad(10).add(new Vec3(0, 0.1, 0));
  }

  startGame() {
    this.player.controlsDisabled = false;
    this.player.autopilot = false;
    this.camera.makeCurrent();
  }

  process(dt) {
    this.wind.volume = 0.5 + Math.sin(this.time * 0.5) * 0.25;
  }
}
