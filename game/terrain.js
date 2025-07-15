import { Mesh, Vec3, perlin, getNormal, Color, BaseMaterial, ShaderMaterial } from "@core/index.js";
import { PlaneGeometry } from "../core/importers/plane.js";
import { TerrainMaterial } from "/game/shaders/terrain.js";

const GRID_SIZE = 10;
const CHUNK_SIZE = 100;

export class Terrain extends Mesh {
  constructor() {
    super(new PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, true), new TerrainMaterial());
  }

  /** @type { import("./player.js").Player } */
  get player() {
    return this.scene?.player;
  }

  /** @type { Vec3 | string } */
  positionHash_ = null;

  get positionHash() {
    return this.positionHash_;
  }

  set positionHash(value) {
    const oldHash = this.positionHash_;
    this.positionHash_ = [value.x, value.z].join(",");

    if (oldHash !== this.positionHash_) {
      this.trigger('positionHashChanged', this.positionHash_);
    }
  }

  enterTree() {
    this.on('positionHashChanged', this.regenerateTerrain.bind(this));
    this.regenerateTerrain();
  }

  process(dt) {
    const gridPos = this.player.position.div(GRID_SIZE).round();
    this.positionHash = gridPos;
    // this.position = gridPos.mul(GRID_SIZE);

    super.process(dt);
  }

  /**
    * @param { number } x - The x coordinate.
    * @param { number } z - The z coordinate.
    */
  getHeightAt(x, z) {
    x /= 10;
    z /= 10;
    return perlin([x, z]);
  }

  getPositionAt(x, z) {
    const h = this.getHeightAt(x, z);
    return new Vec3(x, h, z);
  }

  getNormalAt(x, z) {
    const h1 = this.getHeightAt(x, z);
    const h2 = this.getHeightAt(x + 1, z);
    const h3 = this.getHeightAt(x, z + 1);

    const p1 = new Vec3(x, h1, z);
    const p2 = new Vec3(x + 1, h2, z);
    const p3 = new Vec3(x, h3, z + 1);

    return getNormal(p1, p2, p3).normalized;
  }

  regenerateTerrain() {
    if (!this.player) return;

    // const gridPos = this.player.position.div(GRID_SIZE).round();
    // const vertices = this.geometry.vertices;

    // for (let i = 0; i < vertices.length; i++) {
    //   const v = vertices[i]
    //   const ix = i % (CHUNK_SIZE + 1);
    //   const iz = (i / (CHUNK_SIZE + 1)) >> 0;

    //   // Generate height using Perlin noise
    //   v.x = gridPos.x * GRID_SIZE + ix - CHUNK_SIZE * 0.5;
    //   v.z = gridPos.z * GRID_SIZE + iz - CHUNK_SIZE * 0.5;
    //   v.y = this.getHeightAt(v.x, v.z);

    //   const normal = this.getNormalAt(v.x, v.z);

    //   this.geometry.normals[i] = normal;
    //   normal.y *= -1;
    // }

    this.setup();
  }

  polygonProgram(p, camera) {
    p = p.clone();
    const center = p.center.applyTransform(camera.transform);
    p.color = p.color.mix(Color.GREEN.mul(0.13), 0.85).hueRotate(center.y * 200);

    return p;
  }
}
