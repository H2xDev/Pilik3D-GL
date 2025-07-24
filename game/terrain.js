import { 
  Mesh, 
  Vec3,
  Color, 
  defineSpatialMaterial,
  ShadersManager,
  Camera3D,
  Vec2,
  GameDebugger,
} from "@core/index.js";

import { PlaneGeometry } from "../core/importers/plane.js";
import { SEED, TerrainGenerator } from "./terrainGenerator.js";

const RENDER_DISTANCE = window.innerWidth < 1340 ? 5 : 5; // Number of chunks to render in each direction
const CHUNK_SIZE = 32;
const TARGET_SIZE = 32;

const DEFAULTS = {
  renderDistance: RENDER_DISTANCE,
  chunkSize: CHUNK_SIZE,
  gridSize: TARGET_SIZE,
  scale: TARGET_SIZE / CHUNK_SIZE, // Scale factor for the terrain
}


export class Terrain extends Mesh {
  /**
    * @type { TerrainGenerator }
    */
  terrainGenerator = null;

  options = { ...DEFAULTS };
  referencePosition = new Vec3(0, 0, 0);
  positionHash_ = '';
  renderedChunks = 0;
  wireframe = false;

  /**
    * @param { Partial<typeof this.options> } options - Configuration options for the terrain.
    * @param { Partial<TerrainGenerator['options']> } terrainOptions - Additional options for the terrain material.
    */
  constructor(options = DEFAULTS, terrainOptions = TerrainGenerator.DEFAULT_OPTIONS) {
    const geometry = new PlaneGeometry(options.chunkSize, options.chunkSize, true);
    const vertexShader = ShadersManager.import('/game/shaders/terrain.vert.glsl');
    const fragmentShader = ShadersManager.import('/game/shaders/terrain.frag.glsl');
    const material = new (defineSpatialMaterial(vertexShader, fragmentShader, {
      FIRST_WAVE_ITERATIONS: terrainOptions.firstWaveIterations,
      FIRST_WAVE_POWER: terrainOptions.firstWavePower,
      FIRST_WAVE_MULTIPLIER: terrainOptions.firstWaveMultiplier,
      SECOND_WAVE_ITERATIONS: terrainOptions.secondWaveIterations,
      SECOND_WAVE_MULTIPLIER: terrainOptions.secondWaveMultiplier,
      SECOND_WAVE_POWER: terrainOptions.secondWavePower,
      ROAD_WIDTH: terrainOptions.roadWidth,
      ROAD_INTERPOLATION: terrainOptions.roadInterpolation,
      ROAD_CURVENESS: terrainOptions.roadCurveness,
      SEED
    }))({
      albedo_color: Color.ORANGE.saturation(0.2),
    })

    super(geometry, material);
    Object.assign(this.options, options);

    this.scale = new Vec3(options.scale);
    this.terrainGenerator = new TerrainGenerator(terrainOptions);

    GameDebugger.addDebugInfo('Rendered Chunks', () => this.renderedChunks);
  }

  get camera() {
    return Camera3D.current;
  }

  setup() {
    super.setup();
    this.aabb.size.y = this.aabb.size.x;
  }

  process(dt) {
    const { gridSize } = this.options;

    this.referencePosition = this.camera.position.mul(Vec3.XZ)
      .div(gridSize).round().mul(gridSize);
  }

  /**
    * Renders the terrain chunks based on the current position and render distance.
    * @param { import("@core").Material } material - The material to use for rendering.
    */
  render(material) {
    const { renderDistance, chunkSize, scale: terrainScale, gridSize } = this.options;
    const halfDistance = Math.floor(renderDistance / 2);

    this.renderedChunks = 0;

    const offset = this.camera.basis.forward.mul(gridSize * renderDistance * 0.33)
      .div(gridSize)
      .round()
      .mul(gridSize);

    for (let i = 0; i < renderDistance ** 2; i++) {
      let x = (i % renderDistance) * chunkSize - halfDistance * chunkSize;
      let z = Math.floor(i / renderDistance) * chunkSize - halfDistance * chunkSize;

      this.transform.position = new Vec3(x, 0, z)
        .mul(terrainScale)
        .add(this.referencePosition)
        .add(offset);

      this.renderedChunks += super.render(material) ? 1 : 0;
    }

    return true;
  }

  _render() {
    this.material.applyUniforms();
    this.render(this.material);
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
    return this.terrainGenerator.getHeight(new Vec2(x, z));
  }

  /**
    * @param { number } z - The z coordinate to get the road position for.
    */
  getRoad(z) {
    let { x, y } = this.terrainGenerator.getRoad(z / 2.0);

    x *= 2; // Adjust for the scale factor used in getHeightAt
    y *= 2; // Adjust for the scale factor used in getHeightAt

    return new Vec3(x, this.getHeightAt(x, z), y);
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
