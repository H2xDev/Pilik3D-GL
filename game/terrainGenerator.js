import { Vec3, Vec2 } from "@core/index.js";

export const SEED = 0.618033988749895; 
console.log("SEED", SEED);

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}

function wavedx(position, direction, frequency, timeshift) {
  const x = direction.dot(position) * frequency + timeshift;
  const wave = Math.exp(Math.sin(x) - 1.0);
  const dx = wave * Math.cos(x);
  return new Vec2(wave, -dx);
}

function getwaves(position, iterations, time, SEED) {
  const wavePhaseShift = position.distanceTo(Vec2.ZERO) * 0.1;

  let iter = 0.0;
  let frequency = 1.0;
  let timeMultiplier = 2.0;
  let weight = 1.0;

  let sumOfValues = 0.0;
  let sumOfWeights = 0.0;

  for (let i = 0; i < iterations; i++) {
    const p = new Vec2(Math.sin(iter), Math.cos(iter));

    const res = wavedx(position, p, frequency, time * timeMultiplier + wavePhaseShift);

    position = position.add(p.mul(res.y * weight * 0.38));

    sumOfValues += res.x * weight;
    sumOfWeights += weight;

    weight = mix(weight, 0.0, 0.2);
    frequency *= 1.18;
    timeMultiplier *= 1.07;
    iter += SEED;
  }

  return sumOfValues / sumOfWeights;
}

function easing(x) {
  return -(Math.cos(Math.PI * x) - 1.0) / 2.0;
}


export class TerrainGenerator {
  static DEFAULT_OPTIONS = {
    firstWaveIterations: 10.0,
    firstWavePower: 2.0,
    firstWaveMultiplier: 1.0,

    secondWaveIterations: 10,
    secondWaveMultiplier: 10.0,
    secondWavePower: 4.0,

    roadWidth: 2.0,
    roadInterpolation: 2.0,
    roadCurveness: 1.0,
  };

  options = { ...TerrainGenerator.DEFAULT_OPTIONS };

  /**
    * @param { Partial<typeof this.options> } options - Configuration options for the terrain generator.
    */
  constructor(options = TerrainGenerator.DEFAULT_OPTIONS) {
    Object.assign(this.options, options);
  }

  /**
    * @param { Vec2 } p - The position in the terrain to get the height for.
    */
  getHeight(p) {
    const {
      firstWaveIterations,
      firstWavePower,
      firstWaveMultiplier,
      secondWaveIterations,
      secondWaveMultiplier,
      secondWavePower,
    } = this.options;

    p = p.mul(0.5);

    const waves =
    Math.pow(getwaves(p, firstWaveIterations, 0.0, SEED), firstWavePower) * firstWaveMultiplier +
    Math.pow(getwaves(p.mul(0.25), secondWaveIterations, 0.0, SEED), secondWavePower) * secondWaveMultiplier;

    return mix(waves, waves * 0.2, this.roadValue(p));
  }

  roadCenter(y) {
    const { roadCurveness } = this.options;
    return (
      Math.sin(y * 0.07 * roadCurveness + Math.cos(y * 0.015)) * 8.0 +
      Math.cos(y * 0.18 * roadCurveness + Math.sin(y * 0.035)) * 5.0 +
      Math.sin(y * 0.4) * Math.sin(y * 0.05) * 2.0
    );
  }
  
  dRoadCenter(y) {
    const { roadCurveness } = this.options;
    return (
      // d/dy [ sin(y * 0.07 * c + cos(y * 0.015)) * 8 ]
      Math.cos(y * 0.07 * roadCurveness + Math.cos(y * 0.015)) *
        (0.07 * roadCurveness - Math.sin(y * 0.015) * 0.015) * 8.0 +

      // d/dy [ cos(y * 0.18 * c + sin(y * 0.035)) * 5 ]
      -Math.sin(y * 0.18 * roadCurveness + Math.sin(y * 0.035)) *
        (0.18 * roadCurveness + Math.cos(y * 0.035) * 0.035) * 5.0 +

      // d/dy [ sin(y * 0.4) * sin(y * 0.05) * 2 ]
      (Math.cos(y * 0.4) * 0.4 * Math.sin(y * 0.05) +
       Math.sin(y * 0.4) * Math.cos(y * 0.05) * 0.05) * 2.0
    );
  }
  
  roadDistance(pos) {
    const roadX = this.roadCenter(pos.y);
    const dxdy = this.dRoadCenter(pos.y);
  
    const tangent = new Vec2(dxdy, 1).normalized;
    const normal = new Vec2(-tangent.y, tangent.x);
  
    const center = new Vec2(roadX, pos.y);
    const toPoint = pos.sub(center);
  
    return Math.abs(toPoint.dot(normal));
  }
  
  roadValue(pos) {
    const { roadWidth } = this.options;

    const dist = this.roadDistance(pos);
    const interp = 1.0 - clamp((dist / roadWidth - 0.5) / 0.5, 0.0, 1.0);
    return easing(interp);
  }

  /**
    * @param { number } y - The y coordinate to get the road position for.
    * @returns [number, number] - The road position at the given y coordinate.
    */
  getRoad(y) {
    const nx = this.roadCenter(y);
    return new Vec2(nx, y);
  }

  getForward(z) {
    const x = this.getRoad(z)[0]
    const x2 = this.getRoad(z + 1.0)[0];
    const dx = x2 - x;
    const angle = Math.atan2(dx, 1.0) + Math.PI;

    return new Vec3(
      Math.sin(angle),
      0,
      Math.cos(angle)
    ).normalized;
  }
}
