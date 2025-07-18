export const FIRST_WAVE_ITERATIONS = 20.0;
export const FIRST_WAVE_POWER = 4.0;
export const FIRST_WAVE_MULTIPLIER = 5.0;
export const SECOND_WAVE_ITERATIONS = 20;
export const SECOND_WAVE_MULTIPLIER = 20.0;
export const SECOND_WAVE_POWER = 4.0;
export const ROAD_WIDTH = 1.0;
export const ROAD_INTERPOLATION = 1.0;

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
    iter += 1232.399963;
  }

  return sumOfValues / sumOfWeights;
}

function easing(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function perlin2(position) {
  let waves = Math.pow(getwaves(position, FIRST_WAVE_ITERATIONS), FIRST_WAVE_POWER) * FIRST_WAVE_MULTIPLIER
    + Math.pow(getwaves(position.map(n => n * 0.25), SECOND_WAVE_ITERATIONS), SECOND_WAVE_POWER) * SECOND_WAVE_MULTIPLIER;

  position[0] += Math.sin(position[1] * 0.1) * 10.0;
  position[0] += Math.cos(position[1] * 0.32) * 2.0;

  const targetInterpolation = ROAD_INTERPOLATION + Math.sin(position[1]) * ROAD_INTERPOLATION * 0.25;
  const distanceToRoad = Math.abs(position[0]) - ROAD_WIDTH;
  let interpolation = 1.0 - Math.max(0.0, Math.min(distanceToRoad / targetInterpolation, 1.0));
  interpolation = easing(interpolation);

  waves = mix(waves, waves * 0.1, interpolation);

  return waves;
}
