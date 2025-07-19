import { Mesh, Vec3, Color, GNode3D, defineSpatialMaterial, ShadersManager, Camera3D } from "@core/index.js";
import { PlaneGeometry } from "../core/importers/plane.js";
import { SEED, TerrainGenerator } from "./terrainGenerator.js";

const RENDER_DISTANCE = window.innerWidth < 1340 ? 3 : 10;
const SCALE = window.innerWidth < 1340 ? 1.0 : 0.25;

export class Terrain extends GNode3D {
  mesh = null;

  /**
    * @type { TerrainGenerator }
    */
  terrainGenerator = null;

  options = {
    renderDistance: RENDER_DISTANCE,
    chunkSize: 254,
    gridSize: 100,
    scale: SCALE,
  }

  /**
    * @param { Partial<typeof this.options> } options - Configuration options for the terrain.
    * @param { Partial<TerrainGenerator['options']> } terrainOptions - Additional options for the terrain material.
    */
  constructor(options = {}, terrainOptions = {}) {
    super();

    Object.assign(this.options, options);
    this.terrainGenerator = new TerrainGenerator(terrainOptions);

    const geometry = new PlaneGeometry(this.options.chunkSize, this.options.chunkSize);
    const vertexShader = ShadersManager.import('/game/shaders/terrain.vert.glsl');
    const fragmentShader = ShadersManager.import('/game/shaders/terrain.frag.glsl');

    const material = new (defineSpatialMaterial(vertexShader, fragmentShader, {
        FIRST_WAVE_ITERATIONS: this.terrainGenerator.options.firstWaveIterations,
        FIRST_WAVE_POWER: this.terrainGenerator.options.firstWavePower,
        FIRST_WAVE_MULTIPLIER: this.terrainGenerator.options.firstWaveMultiplier,
        SECOND_WAVE_ITERATIONS: this.terrainGenerator.options.secondWaveIterations,
        SECOND_WAVE_MULTIPLIER: this.terrainGenerator.options.secondWaveMultiplier,
        SECOND_WAVE_POWER: this.terrainGenerator.options.secondWavePower,
        ROAD_WIDTH: this.terrainGenerator.options.roadWidth,
        ROAD_INTERPOLATION: this.terrainGenerator.options.roadInterpolation,
        ROAD_CURVENESS: this.terrainGenerator.options.roadCurveness,
        SEED
      }))({
        albedo_color: Color.ORANGE.saturation(0.2),
      })

    this.mesh = Object.assign(new Mesh(geometry, material), {
      scale: new Vec3(this.options.scale),
    });
  }

  /** @type { import("./player.js").Player } */
  get player() {
    return Camera3D.current || this.scene.player;
  }

  process(dt) {
    const { renderDistance, chunkSize, gridSize, scale: terrainScale } = this.options;

    this.position = this.player.position.div(gridSize).round().mul(gridSize);

    for (let i = 0; i < renderDistance ** 2; i++) {
      const size = (renderDistance * chunkSize) * 0.5;
      const x = (i % renderDistance ) * chunkSize- size;
      const z = Math.floor(i / renderDistance ) * chunkSize- size;

      this.mesh.position = new Vec3(x, 0, z).mul(terrainScale).add(this.position);
      this.mesh.process(dt);
    }

    super.process(dt);
  }

  getPositionAt(x, z) {
    const h = this.getHeightAt(x, z);
    return new Vec3(x, h, z);
  }

  getNormalAt(x, z) {
    const h1 = this.getHeightAt(x, z)
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
    return this.terrainGenerator.getHeight([x, z]);
  }

  /**
    * @param { number } z - The z coordinate to get the road position for.
    */
  getRoad(z) {
    let [x, z1] = this.terrainGenerator.getRoad(z / 2.0);
    x *= 2; // Adjust for the scale factor used in getHeightAt
    z1 *= 2; // Adjust for the scale factor used in getHeightAt

    return new Vec3(x, this.getHeightAt(x, z), z1);
  }

  getRoadForward(z) {
    const p = this.getRoad(z);
    const p2 = this.getRoad(z - 1.0);
    p.y = 0;
    p2.y = 0;

    return p2.sub(p).normalized;
  }

  getDistanceToRoad(x, z) {
    const roadX = this.getRoad(z).x;
    return Math.abs(roadX - x);
  }
}
