import { 
  Scene,
  Camera3D,
  Fog,
  Vec3,
  Color,
  DirectionalLight,
  FogType,
  StateMachine,
  GameDebugger,
  Vec2,
} from '@core/index.js';

import { Terrain } from './terrain.js';
import { Player } from './player.js';
import { til } from './utils.js';
import { FLYING_STATE } from './states/flyingState.js';

const AMBIENT_COLOR = Color.BLUE.mix(Color.WHITE, 0.5).saturation(0.25);
const SUN_DIRECTION = Vec3.DOWN.add(Vec3.LEFT.mul(2.0)).normalized;

export const Game = new class GameScene extends Scene {
  sun             = Object.assign(this.addChild(new DirectionalLight(Color.ORANGE.saturation(0.5), SUN_DIRECTION, AMBIENT_COLOR)), {
    energy: 4.0
  })
  terrain         = this.addChild(new Terrain());
  player          = this.addChild(new Player());
  camera          = this.addChild(new Camera3D());
  stateMachine    = this.addChild(new StateMachine(FLYING_STATE));
  fog             = this.addChild(new Fog(FogType.EXPONENTIAL, this.sun.ambient, 0.025));
  fps             = 0;

  async begin() {
    await til(() => !!this.player.model);
    this.player.position = this.terrain.getRoad(0).add(new Vec3(0, 0.1, 0));

    GameDebugger.addDebugInfo('FPS', () => this.fps);
  }

  process(dt) {
    this.fps = Math.round(1 / dt);
  }
}
