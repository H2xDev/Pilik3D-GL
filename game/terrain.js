import { Mesh, Vec3, Color } from "@core/index.js";
import { PlaneGeometry } from "../core/importers/plane.js";
import { TerrainMaterial } from "./materials/terrain.material.js";
import { perlin2 } from "./perlin2.js";

const GRID_SIZE = 10;
const CHUNK_SIZE = 254;

export class Terrain extends Mesh {
  constructor() {
    super(new PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, true), new TerrainMaterial());
    this.scale = new Vec3(0.33);
  }

  /** @type { import("./player.js").Player } */
  get player() {
    return this.scene?.player;
  }

  process(dt) {
    const gridPos = this.player.position.div(GRID_SIZE).round();
    this.position = gridPos.mul(GRID_SIZE);

    super.process(dt);
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

    return p2.sub(p1).cross(p3.sub(p1)).normalized.mul(-1);
  }

  /**
    * @param { number } x - The x coordinate.
    * @param { number } z - The z coordinate.
    */
  getHeightAt(x, z) {
    x /= 2;
    z /= 2;
    return perlin2([x, z]);
  }
}
