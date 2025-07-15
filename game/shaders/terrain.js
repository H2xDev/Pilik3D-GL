import { defineSpatialMaterial, Color } from '@core/index.js';
import { perm } from '../perlin.js';

const VERTEX_SHADER = /* glsl */`
  const int perm[512] = int[](
    ${perm.join(', ')}
  );
  
  const vec2 grad2[8] = vec2[](
    vec2( 1, 0), vec2(-1, 0), vec2( 0, 1), vec2( 0, -1),
    vec2( 1, 1), vec2(-1, 1), vec2( 1, -1), vec2(-1, -1)
  );
  
  float fade(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }
  
  float perlin(vec2 pos) {
    ivec2 p = ivec2(floor(pos)) & 255;
    vec2 f = fract(pos);
  
    float u = fade(f.x);
    float v = fade(f.y);
  
    int aa = perm[perm[p.x] + p.y] % 8;
    int ab = perm[perm[p.x] + p.y + 1] % 8;
    int ba = perm[perm[p.x + 1] + p.y] % 8;
    int bb = perm[perm[p.x + 1] + p.y + 1] % 8;
  
    float x1 = dot(grad2[aa], vec2(f.x,     f.y));
    float x2 = dot(grad2[ba], vec2(f.x - 1.0, f.y));
    float y1 = dot(grad2[ab], vec2(f.x,     f.y - 1.0));
    float y2 = dot(grad2[bb], vec2(f.x - 1.0, f.y - 1.0));
  
    float nx0 = mix(x1, x2, u);
    float nx1 = mix(y1, y2, u);
    return pow(mix(nx0, nx1, v), 4.0) * 10.0;
  }
  
  void vertex() {
    vec2 vpos = v_position.xz / 10.0;
    v_position.y = perlin(vpos);
  
    float h1 = v_position.y;
    float h2 = perlin(vpos + vec2(0.1, 0.0));
    float h3 = perlin(vpos + vec2(0.0, 0.1));
  
    vec3 p1 = vec3(vpos.x, h1, vpos.y);
    vec3 p2 = vec3(vpos.x + 1.0, h2, vpos.y);
    vec3 p3 = vec3(vpos.x, h3, vpos.y + 1.0);
    v_normal = -normalize(cross(p2 - p1, p3 - p1));
  }
`;

const FRAGMENT_SHADER = /* glsl */`
  void fragment(inout vec3 color) {
    float cz = v_position.z + sin(v_position.x * 5.0) * 0.1;

    float dist = length(v_position.xz);
    float direction = atan(v_position.z, v_position.x);

    float wave = sin((cz + v_position.x) * 20.0) * 0.5 + 0.5;
    float wave_affect = 1.0 - pow(max(0.0, dot(vec3(0.0, 1.0, 0.0), v_normal)), 10.0);

    color = mix(color, color * 0.8, wave * wave_affect);
  }
`


export class TerrainMaterial extends defineSpatialMaterial()
  .vertex(VERTEX_SHADER)
  .fragment(FRAGMENT_SHADER)
  .compile() 
{
  params = {
    albedo_color: Color.ORANGE,
    specular: false,
    specular_power: 2.0,
  }
}
