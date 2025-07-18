import { defineSpatialMaterial, Color, ShadersManager } from '@core/index.js';
import { 
  FIRST_WAVE_ITERATIONS,
  FIRST_WAVE_MULTIPLIER,
  FIRST_WAVE_POWER,
  SECOND_WAVE_ITERATIONS,
  SECOND_WAVE_MULTIPLIER,
  SECOND_WAVE_POWER,
  ROAD_WIDTH,
  ROAD_INTERPOLATION,
} from '/game/perlin2.js';

export class TerrainMaterial extends defineSpatialMaterial()
  .vertex(ShadersManager.instance.import('/game/shaders/terrain.vert.glsl'), {
    FIRST_WAVE_ITERATIONS,
    FIRST_WAVE_POWER,
    FIRST_WAVE_MULTIPLIER,
    SECOND_WAVE_ITERATIONS,
    SECOND_WAVE_MULTIPLIER,
    SECOND_WAVE_POWER,
    ROAD_WIDTH,
    ROAD_INTERPOLATION,
  })
  .fragment(ShadersManager.instance.import('/game/shaders/terrain.frag.glsl'))
  .compile() 
{
  params = {
    albedo_color: Color.ORANGE.saturation(-0.25),
    specular: false,
    specular_power: 2.0,
  }
}
