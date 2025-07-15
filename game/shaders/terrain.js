import { defineSpatialMaterial, Color } from '@core/index.js';

const VERTEX_SHADER = /* glsl */`
vec2 fade(vec2 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 grad2(float hash) {
    float angle = 6.2831853 * hash; // 2π
    return vec2(cos(angle), sin(angle));
}

float perlin(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = fade(f);

    float h00 = hash(i + vec2(0.0, 0.0));
    float h10 = hash(i + vec2(1.0, 0.0));
    float h01 = hash(i + vec2(0.0, 1.0));
    float h11 = hash(i + vec2(1.0, 1.0));

    vec2 g00 = grad2(h00);
    vec2 g10 = grad2(h10);
    vec2 g01 = grad2(h01);
    vec2 g11 = grad2(h11);

    float n00 = dot(g00, f - vec2(0.0, 0.0));
    float n10 = dot(g10, f - vec2(1.0, 0.0));
    float n01 = dot(g01, f - vec2(0.0, 1.0));
    float n11 = dot(g11, f - vec2(1.0, 1.0));

    float nx0 = mix(n00, n10, u.x);
    float nx1 = mix(n01, n11, u.x);
    float nxy = mix(nx0, nx1, u.y);

    return nxy;
}

void vertex() {
  vec2 vpos = -v_position.xz / 10.0;
  v_position.y = perlin(vpos);

  float h1 = v_position.y;
  float h2 = perlin(vpos + vec2(0.1, 0.0));
  float h3 = perlin(vpos + vec2(0.0, 0.1));

  vec3 p1 = vec3(vpos.x, h1, vpos.y);
  vec3 p2 = vec3(vpos.x + 1.0, h2, vpos.y);
  vec3 p3 = vec3(vpos.x, h3, vpos.y + 1.0);
  v_normal = -normalize(cross(p2 - p1, p3 - p1));
}
`

export class TerrainMaterial extends defineSpatialMaterial().vertex(VERTEX_SHADER).compile() {
  params = {
    albedo_color: Color.GREEN,
    specular: false,
    specular_power: 32.0,
  }
}
