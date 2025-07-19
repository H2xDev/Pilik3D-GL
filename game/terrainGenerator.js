import { Vec3 } from "@core/vec3.js";

export const SEED = +(Math.random() * 2000).toFixed(6);
console.log("SEED", SEED);

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function length(v) {
  return Math.sqrt(dot(v, v));
}

function sin(x) {
  return Math.sin(x);
}

function cos(x) {
  return Math.cos(x);
}

function exp(x) {
  return Math.exp(x);
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}

function wavedx(position, direction, frequency, timeshift) {
  const x = dot(direction, position) * frequency + timeshift;
  const wave = exp(sin(x) - 1.0);
  const dx = wave * cos(x);
  return [wave, -dx];
}

function getwaves(position, iterations, time = 0.0) {
  let wavePhaseShift = length(position) * 0.1;
  let iter = 0.0;
  let frequency = 1.0;
  let timeMultiplier = 2.0;
  let weight = 1.0;
  let sumOfValues = 0.0;
  let sumOfWeights = 0.0;
  position = [...position]; // clone to avoid mutating input

  for (let i = 0; i < iterations; i++) {
    const p = [Math.sin(iter), Math.cos(iter)];
    const res = wavedx(position, p, frequency, time * timeMultiplier + wavePhaseShift);

    position[0] += p[0] * res[1] * weight * 0.38;
    position[1] += p[1] * res[1] * weight * 0.38;

    sumOfValues += res[0] * weight;
    sumOfWeights += weight;

    weight = mix(weight, 0.0, 0.2);
    frequency *= 1.18;
    timeMultiplier *= 1.07;
    iter += SEED;
  }

  return sumOfValues / sumOfWeights;
}

function easing(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

export class TerrainGenerator {
  options = {
    firstWaveIterations: 10.0,
    firstWavePower: 2.0,
    firstWaveMultiplier: 2.0,

    secondWaveIterations: 4,
    secondWaveMultiplier: 6.0,
    secondWavePower: 2.0,

    roadWidth: 2.0,
    roadInterpolation: 2.0,
    roadCurveness: 1.0,
  };

  /**
    * @param { Partial<typeof this.options> } options - Configuration options for the terrain generator.
    */
  constructor(options = {}) {
    Object.assign(this.options, options);
  }
  /**
    * @param { [number, number] } position - The position in the terrain to get the height for.
    */
  getHeight(position) {
    const { firstWaveIterations, firstWavePower, firstWaveMultiplier,
            secondWaveIterations, secondWaveMultiplier, secondWavePower,
            roadWidth, roadInterpolation } = this.options;

    position = position.map(n => n * 0.5);

    let [x, y] = position;

    let waves = Math.pow(getwaves(position, firstWaveIterations), firstWavePower) * firstWaveMultiplier;
    waves += Math.pow(getwaves(position.map(n => n * 0.25), secondWaveIterations), secondWavePower) * secondWaveMultiplier;
  
    const roadPos = this.getRoad(y);
    const roadLength = new Vec3(roadPos[0], 0, roadPos[1]).sub(new Vec3(x, 0, y)).length;

    const distanceToRoad = Math.max(0.0, roadLength - roadWidth * 0.5);
    let interpolation = 1.0 - Math.max(0.0, Math.min(distanceToRoad / roadInterpolation, 1.0));
    interpolation = easing(interpolation);
  
    return mix(waves, waves * 0.2, interpolation);
  }

  // FIXME: Something wrong with the road coords
  /**
    * @param { number } y - The y coordinate to get the road position for.
    * @returns [number, number] - The road position at the given y coordinate.
    */
  getRoad(y) {
    const { roadCurveness } = this.options;

    let nx = Math.sin(y * 0.1 * roadCurveness) * 10.0;
    nx += Math.cos(y * 0.32 * roadCurveness) * 2.0;

    return [nx, y];
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
