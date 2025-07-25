import { 
  Input,
  Vec3,
  Mesh,
  GNode3D,
  Color,
  Basis,
  GSound,
  ResourceManager,
  getNormal,
} from '@core';

import { OBJImporter } from '@core/importers/obj.js';
import { getAcceleration, getFrictionRate } from './utils.js';
import { CylinderGeometry } from '@core/importers/cylinder.js';
import { Terrain } from './terrain.js';
import { Camera3D } from '@core';
import { canvas } from '@core';
import { Vec2 } from '@core';

const GRAVITY = 2.81; // Gravity constant

const CAR_MATERIAL = ResourceManager.create('BaseMaterial', {
  albedo_color: Color.RED,
  shading_hardness: 3.0,
})

const BACK_TIRE_GEOMETRY = new CylinderGeometry(0.4, 2.5, 8);
const FORWARD_TIRE_GEOMETRY = new CylinderGeometry(0.4, 0.4, 8);
const TIRE_MATERIAL = ResourceManager.create('BaseMaterial', {
  albedo_color: Color.BLACK,
})

export class Player extends GNode3D {
  velocity = Vec3.ZERO;
  keyboard = {};

  /** @type { Mesh } */
  model = null;
  isOnGround = false;
  turnVelocity = 0;
  turnSpeed = 5;
  movementSpeed = 20;
  forwardSpeed = 0;
  friction = 5;
  debug = false;
  aim = Basis.IDENTITY;
  tireRotation = 0;
  controlsDisabled = false;
  autopilot = false;
  volume = 0.0;

  input = new Input({
    "moveForward": "KeyW",
    "moveBack": "KeyS",
    "turnLeft": "KeyA",
    "turnRight": "KeyD",
  })

  engineLoop = new GSound('/game/assets/reving.ogg', { loop: true, volume: 0.1 });
  screetchLoop = new GSound('/game/assets/tire_screech.ogg', { loop: true, volume: 0.0 });

  /**
    * @type { Terrain }
    */
  get terrain() {
    return this.scene.terrain;
  }

  get camera() {
    return this.scene.camera;
  }

  get driftValue() {
    if (!this.model) return 0;
    if (!this.isOnGround) return 0;

    const velocityXZ = this.velocity.mul(Vec3.XZ).normalized;
    const forwardXZ = this.model.basis.forward.mul(Vec3.XZ).normalized;

    return Math.abs(1 - velocityXZ.dot(forwardXZ)) * this.velocity.length;
  }

  get flyValue() {
    return this.isOnGround ? 0 : Math.abs(this.velocity.length) * 0.1;
  }

  get targetCameraPosition() {
    if (!this.model) return this.position.add(Vec3.UP.mul(0.6));

    const pos = this.position
      .add(this.model.globalTransform.basis.forward
        .mul(-2.0)
        .add(this.camera.basis.forward
          .mul(this.velocity.length * 0.1)))
      .add(this.model.globalTransform.basis.up
        .mul(0.5));

    // NOTE: Prevent camera from going below terrain
    const minY = this.terrain.getHeightAt(pos.x, pos.z) + 0.25;
    pos.y = Math.max(pos.y, minY);

    return pos;
  }

  async enterTree() {
    const modelData = await fetch('/game/assets/car.obj')
      .then(res => res.text());

    this.model = new Mesh(new OBJImporter(modelData), CAR_MATERIAL)
    this.model.scale = new Vec3(0.125, 0.125, 0.125);
    this.model.position.y = 0.09;

    this.backTires = new Mesh(BACK_TIRE_GEOMETRY, TIRE_MATERIAL);
    this.forwardTire1 = new Mesh(FORWARD_TIRE_GEOMETRY, TIRE_MATERIAL);
    this.forwardTire2 = new Mesh(FORWARD_TIRE_GEOMETRY, TIRE_MATERIAL);

    this.backTires.position = new Vec3(0.0, -0.05, 0.15);
    this.backTires.basis = Basis.IDENTITY.lookAt(Vec3.FORWARD, Vec3.LEFT);
    this.forwardTire1.position = new Vec3(0.13, -0.05, -0.20);
    this.forwardTire1.basis = Basis.IDENTITY.lookAt(Vec3.FORWARD, Vec3.LEFT);
    this.forwardTire2.position = new Vec3(-0.13, -0.05, -0.20);
    this.forwardTire2.basis = Basis.IDENTITY.lookAt(Vec3.FORWARD, Vec3.RIGHT);

    window.addEventListener('click', (keyCode) => {
      this.engineLoop.play()
      this.screetchLoop.play();
    }, { once: true });

    this.addChild(this.model);
    this.model.addChild(this.backTires);
    this.model.addChild(this.forwardTire1);
    this.model.addChild(this.forwardTire2);
    this.model.basis.forward = this.terrain.getRoadForward(this.position.z);
    this.position = this.terrain.getRoad(this.position.z);

    this.camera.position = this.targetCameraPosition;
    this.camera.basis = this.model.globalTransform.basis;
  }

  /**
    * @param { number } dt - Delta time in seconds.
    */
  process(dt) {
    if (!this.model) return;

    this.processAutopilot(dt);
    this.processCamera(dt);
    this.processMovement(dt);
    this.processGravity(dt);
    this.processSound(dt);
    this.processTireAnimation(dt);
  }

  processAutopilot(dt) {
    if (!this.autopilot) return;
    if (!dt) return;
    const vel = this.velocity.mul(0.57);
    const forward = this.terrain.getRoadForward(this.position.add(vel).z);
    const angle = forward.angleTo(this.model.basis.forward, Vec3.UP);
    this.forwardSpeed = 0.8;
    this.turnVelocity = -angle * 2.0;
  }

  processSound(dt) {
    const volume = Math.max(Math.min(1, this.velocity.length / this.movementSpeed) * 0.25, 0.1);
    this.engineLoop.volume = volume * this.volume;

    const pitch = this.velocity.length % 2;
    const pitchLap = Math.floor(this.velocity.length / 5);
    this.engineLoop.rate = 0.3 + pitch * 0.2 + pitchLap * 0.3;

    this.screetchLoop.volume = Math.min(0.25, this.driftValue / 1) * this.volume;
  }


  processCamera(dt) {
    this.camera.position = this.camera.position
      .lerp(this.targetCameraPosition, 10 * dt);

    const targetBasis = this.model.globalTransform.basis;

    this.camera.basis = this.camera.basis
      .slerp(targetBasis, 4 * dt)
      .rotated(this.basis.up, this.turnVelocity * dt)
      .multiply(Basis.IDENTITY.rotated(Vec3.FORWARD, this.turnVelocity * 0.5 * -dt));

    // this.camera.fov = 45 + this.velocity.length * 3.0;
  }

  processTireAnimation(dt) {
    const tireRotation = Math.max(Math.PI * -0.25, Math.min(Math.PI * 0.25, -this.turnVelocity));

    this.backTires.basis = Basis.IDENTITY.lookAt(Vec3.FORWARD, Vec3.LEFT)
      .rotate(Vec3.RIGHT, this.tireRotation);

    this.forwardTire1.basis = Basis.IDENTITY.lookAt(Vec3.FORWARD, Vec3.LEFT)
      .rotate(Vec3.LEFT, this.tireRotation)
      .rotate(Vec3.UP, tireRotation);

    this.forwardTire2.basis = Basis.IDENTITY.lookAt(Vec3.FORWARD, Vec3.LEFT)
      .rotate(Vec3.LEFT, this.tireRotation)
      .rotate(Vec3.UP, tireRotation);
  }

  processMovement(dt) {
    let { x, y } = this.input.getAxis("turnRight", "turnLeft", "moveForward", "moveBack");

    if (this.controlsDisabled || this.autopilot) {
      x = 0;
      y = 0;
    }

    this.forwardSpeed -= (this.forwardSpeed - y) * dt;

    this.position = this.position
      .add(this.velocity.mul(dt));

    const acceleration = getAcceleration(this.movementSpeed, this.friction, dt);
    if (this.isOnGround) {
      this.rotationSign = this.velocity.mul(Vec3.XZ).dot(this.model.basis.forward) < 0 ? 1 : -1;
      this.turnVelocity += (x * this.forwardSpeed) * 3.0 * -dt;
      this.turnVelocity -= this.turnVelocity * dt;

      this.velocity = this.velocity
        .add(this.model.basis.forward.mul(acceleration * dt * this.forwardSpeed));

      this.velocity = this.velocity.mul(getFrictionRate(this.friction, dt));

      if (this.keyboard['Space']) {
        this.velocity = this.velocity.add(this.model.basis.up);
      }

      this.model.basis
        .rotate(this.model.basis.up, this.turnVelocity * dt);
    } else {
      this.model.basis.rotate(Vec3.UP, this.turnVelocity * dt);
    }

    this.tireRotation += acceleration * this.forwardSpeed * dt;
  }

  /**
    * Processing 4 points around the player to determine normal vector and ground height.
    */
  processGravity(dt) {
    const { forward: modelForward, left: modelLeft, right: modelRight } = this.model.basis;
    const { terrain } = this;

    const p1 = modelForward.mul(0.3).add(modelLeft.mul(0.125)).add(this.position);
    const p2 = modelForward.mul(0.3).add(modelRight.mul(0.125)).add(this.position);
    const p3 = modelForward.mul(-0.3).add(modelLeft.mul(0.125)).add(this.position);
    const p4 = modelForward.mul(-0.3).add(modelRight.mul(0.125)).add(this.position);

    const h1 = p1.mul(Vec3.XZ).add(Vec3.UP.mul(terrain.getHeightAt(p1.x, p1.z)));
    const h2 = p2.mul(Vec3.XZ).add(Vec3.UP.mul(terrain.getHeightAt(p2.x, p2.z)));
    const h3 = p3.mul(Vec3.XZ).add(Vec3.UP.mul(terrain.getHeightAt(p3.x, p3.z)));
    const h4 = p4.mul(Vec3.XZ).add(Vec3.UP.mul(terrain.getHeightAt(p4.x, p4.z)));

    const n1 = getNormal(h1, h2, h3);
    const n2 = getNormal(h2, h4, h3);
    const targetY = (h1.y + h2.y + h3.y + h4.y) / 4;
    const normal = n1.add(n2).normalized;
    normal.y = Math.abs(normal.y);

    this.isOnGround = this.position.y - 0.01 <= targetY && this.velocity.y < 0;

    if (!this.isOnGround) {
      this.velocity = this.velocity.add(Vec3.UP.mul(-GRAVITY * dt)); // Gravity
    }

    // NOTE: Align the model's up vector with the terrain normal
    this.model.basis.up = this.isOnGround
      ? normal
      : this.model.basis.up.lerp(Vec3.UP, dt);

    const targetPos = Math.max(targetY, this.position.y);
    this.position.y = targetPos;
  }
}
