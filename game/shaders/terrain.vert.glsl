#define FIRST_WAVE_ITERATIONS #inject FIRST_WAVE_ITERATIONS
#define FIRST_WAVE_POWER #inject FIRST_WAVE_POWER
#define FIRST_WAVE_MULTIPLIER #inject FIRST_WAVE_MULTIPLIER
#define SECOND_WAVE_ITERATIONS #inject SECOND_WAVE_ITERATIONS
#define SECOND_WAVE_MULTIPLIER #inject SECOND_WAVE_MULTIPLIER
#define SECOND_WAVE_POWER #inject SECOND_WAVE_POWER
#define ROAD_WIDTH float(#inject ROAD_WIDTH)
#define ROAD_INTERPOLATION float(#inject ROAD_INTERPOLATION)
#define ROAD_CURVENESS float(#inject ROAD_CURVENESS)

#define SEED #inject SEED
#define PI 3.141592653589793

out float road_value;
out float road_x;

// Credit: afl_ext
// https://www.shadertoy.com/view/MdXyzX

vec2 wavedx(vec2 position, vec2 direction, float frequency, float timeshift) {
  float x = dot(direction, position) * frequency + timeshift;
  float wave = exp(sin(x) - 1.0);
  float dx = wave * cos(x);
  return vec2(wave, -dx);
}

float getwaves(vec2 position, int iterations, float time) {
  float wavePhaseShift = length(position) * 0.1; // this is to avoid every octave having exactly the same phase everywhere
  float iter = 0.0; // this will help generating well distributed wave directions
  float frequency = 1.0; // frequency of the wave, this will change every iteration
  float timeMultiplier = 2.0; // time multiplier for the wave, this will change every iteration
  float weight = 1.0;// weight in final sum for the wave, this will change every iteration
  float sumOfValues = 0.0; // will store final sum of values
  float sumOfWeights = 0.0; // will store final sum of weights

  for(int i=0; i < iterations; i++) {
      vec2 p = vec2(sin(iter), cos(iter));
      vec2 res = wavedx(position, p, frequency, time * timeMultiplier + wavePhaseShift);

      position += p * res.y * weight * 0.38;
      sumOfValues += res.x * weight;
      sumOfWeights += weight;
      weight = mix(weight, 0.0, 0.2);
      frequency *= 1.18;
      timeMultiplier *= 1.07;
      iter += SEED;
  }

  return sumOfValues / sumOfWeights;
}

float easing(float x) {
  return -(cos(PI * x) - 1.0) / 2.0;
}

float roadCenter(float y) {
    return
        sin(y * 0.07 * ROAD_CURVENESS + cos(y * 0.015)) * 8.0 +
        cos(y * 0.18 * ROAD_CURVENESS + sin(y * 0.035)) * 5.0 +
        sin(y * 0.4) * sin(y * 0.05) * 2.0;
}

float dRoadCenter(float y) {
 return
        // d/dy [ sin(...) * 8.0 ]
        cos(y * 0.07 * ROAD_CURVENESS + cos(y * 0.015)) *
        (0.07 * ROAD_CURVENESS - sin(y * 0.015) * 0.015) * 8.0

        // d/dy [ cos(...) * 5.0 ]
        -sin(y * 0.18 * ROAD_CURVENESS + sin(y * 0.035)) *
        (0.18 * ROAD_CURVENESS + cos(y * 0.035) * 0.035) * 5.0

        // d/dy [ sin(y * 0.4) * sin(y * 0.05) * 2.0 ]
        + (cos(y * 0.4) * 0.4 * sin(y * 0.05) +
           sin(y * 0.4) * cos(y * 0.05) * 0.05) * 2.0;
}

float roadDistance(vec2 pos) {
  road_x = roadCenter(pos.y);
  float dxdy = dRoadCenter(pos.y);
  
  vec2 tangent = normalize(vec2(dxdy, 1.0));
  vec2 normal = vec2(-tangent.y, tangent.x);
  
  vec2 center = vec2(road_x, pos.y);
  vec2 toPoint = pos - center;
  
  return abs(dot(toPoint, normal));
}

float roadValue(vec2 pos) {
  float dist = roadDistance(pos);
  float interp = 1.0 - clamp((dist / ROAD_WIDTH - 0.5) / 0.5, 0.0, 1.0);
  return easing(interp);
}

float terrain(vec2 pos) {
  float waves = 
    + pow(getwaves(pos, FIRST_WAVE_ITERATIONS, 0.0), float(FIRST_WAVE_POWER)) * float(FIRST_WAVE_MULTIPLIER)
    + pow(getwaves(pos * 0.25, SECOND_WAVE_ITERATIONS, 0.0), float(SECOND_WAVE_POWER)) * float(SECOND_WAVE_MULTIPLIER);

  road_value = roadValue(pos);

  return mix(waves, waves * 0.2, road_value);
}

void vertex() {
  vec2 vpos = v_position.xz / 2.0;

  v_position.y = terrain(vpos);

  float h1 = v_position.y;
  float h2 = terrain(vpos + vec2(0.1, 0.0));
  float h3 = terrain(vpos + vec2(0.0, 0.1));

  vec3 p1 = vec3(vpos.x, h1, vpos.y);
  vec3 p2 = vec3(vpos.x + 0.1, h2, vpos.y);
  vec3 p3 = vec3(vpos.x, h3, vpos.y + 0.1);
  v_normal = -normalize(cross(p2 - p1, p3 - p1));
}
