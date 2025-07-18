#define FIRST_WAVE_ITERATIONS #inject FIRST_WAVE_ITERATIONS
#define FIRST_WAVE_POWER #inject FIRST_WAVE_POWER
#define FIRST_WAVE_MULTIPLIER #inject FIRST_WAVE_MULTIPLIER
#define SECOND_WAVE_ITERATIONS #inject SECOND_WAVE_ITERATIONS
#define SECOND_WAVE_MULTIPLIER #inject SECOND_WAVE_MULTIPLIER
#define SECOND_WAVE_POWER #inject SECOND_WAVE_POWER
#define ROAD_WIDTH #inject ROAD_WIDTH
#define ROAD_INTERPOLATION #inject ROAD_INTERPOLATION
#define PI 3.1415926535897932384626433832795

// Calculates wave value and its derivative, 
// for the wave direction, position in space, wave frequency and time
vec2 wavedx(vec2 position, vec2 direction, float frequency, float timeshift) {
	float x = dot(direction, position) * frequency + timeshift;
  	float wave = exp(sin(x) - 1.0);
  	float dx = wave * cos(x);
  	return vec2(wave, -dx);
}

// Calculates waves by summing octaves of various waves with various parameters
float getwaves(vec2 position, int iterations, float time) {
	float wavePhaseShift = length(position) * 0.1; // this is to avoid every octave having exactly the same phase everywhere
  float iter = 0.0; // this will help generating well distributed wave directions
  float frequency = 1.0; // frequency of the wave, this will change every iteration
  float timeMultiplier = 2.0; // time multiplier for the wave, this will change every iteration
  float weight = 1.0;// weight in final sum for the wave, this will change every iteration
  float sumOfValues = 0.0; // will store final sum of values
  float sumOfWeights = 0.0; // will store final sum of weights

  for(int i=0; i < iterations; i++) {
  // generate some wave direction that looks kind of random
    	vec2 p = vec2(sin(iter), cos(iter));
    	
    	// calculate wave data
    	vec2 res = wavedx(position, p, frequency, time * timeMultiplier + wavePhaseShift);

    	// shift position around according to wave drag and derivative of the wave
    	position += p * res.y * weight * 0.38;

    	// add the results to sums
    	sumOfValues += res.x * weight;
    	sumOfWeights += weight;

    	// modify next octave ;
    	weight = mix(weight, 0.0, 0.2);
    	frequency *= 1.18;
    	timeMultiplier *= 1.07;

    	// add some kind of random value to make next wave look random too
    	iter += 1232.399963;
  }
  // calculate and return
  return sumOfValues / sumOfWeights;
}

float easing(float x) {
  return -(cos(PI * x) - 1.0) / 2.0;
}

float perlin(vec2 pos) {
  float waves = pow(getwaves(pos, FIRST_WAVE_ITERATIONS, 0.0), float(FIRST_WAVE_POWER)) * float(FIRST_WAVE_MULTIPLIER)
    + pow(getwaves(pos * 0.25, SECOND_WAVE_ITERATIONS, 0.0), float(SECOND_WAVE_POWER)) * float(SECOND_WAVE_MULTIPLIER);

  pos.x += sin(pos.y * 0.1) * 10.0;
  pos.x += cos(pos.y * 0.32) * 2.0;

  float targetInterpolation = float(ROAD_INTERPOLATION) + sin(pos.y) * float(ROAD_INTERPOLATION) * 0.25;
  float distanceToRoad = abs(pos.x) - float(ROAD_WIDTH);
  float interpolation = 1.0 - clamp(distanceToRoad / targetInterpolation, 0.0, 1.0);
  interpolation = easing(interpolation);

  return mix(waves, waves * 0.1, interpolation);
}

void vertex() {
  vec2 vpos = v_position.xz / 2.0;
  v_position.y = perlin(vpos);

  float h1 = v_position.y;
  float h2 = perlin(vpos + vec2(0.25, 0.0));
  float h3 = perlin(vpos + vec2(0.0, 0.25));

  vec3 p1 = vec3(vpos.x, h1, vpos.y);
  vec3 p2 = vec3(vpos.x + 1.0, h2, vpos.y);
  vec3 p3 = vec3(vpos.x, h3, vpos.y + 1.0);
  v_normal = -normalize(cross(p2 - p1, p3 - p1));
}
