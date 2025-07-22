precision highp float;

out vec4 outColor;

in vec3             v_normal;
in vec4             v_position;
in vec3             v_camera_world_position;
in vec3             v_camera_forward;
in vec4             v_position_clip_space;
in vec4             v_depth_texcoord;

// Specular
uniform bool        specular;
uniform float       specular_power;
uniform vec3        albedo_color;
uniform float       shading_hardness;

// Directional light
uniform vec3        SUN_COLOR;
uniform vec3        SUN_DIRECTION;
uniform vec3        SUN_AMBIENT;
uniform float       SUN_ENERGY;
uniform float       SUN_SHADOW_BIAS;
uniform float       SUN_TEXEL_SIZE;
uniform sampler2D   SUN_DEPTH_TEXTURE;

// Fog
uniform vec3        FOG_COLOR;
uniform bool        FOG_TYPE;
uniform bool        FOG_ENABLED;
uniform float       FOG_DENSITY;

void processFog(inout vec3 color) {
  if (!FOG_ENABLED) return;

  float distance = length(v_position.xyz - v_camera_world_position);
  float linear_distance = max(0.0, distance - FOG_DENSITY) / FOG_DENSITY;

  float fog_factor = FOG_TYPE
    ? exp(-FOG_DENSITY * distance)
    : max(0.0, 1.0 - linear_distance);

  color = mix(color, FOG_COLOR, 1.0 - fog_factor);
}

float sampleShadowPCF(float bias, float texelSize) {
    vec3 proj = v_depth_texcoord.xyz / v_depth_texcoord.w;
    proj = proj * 0.5 + 0.5;

    if (proj.x < 0.0 || proj.x > 1.0 ||
        proj.y < 0.0 || proj.y > 1.0 ||
        proj.z < 0.0 || proj.z > 1.0)
        return 1.0;

    float result = 0.0;
    float weightSum = 0.0;

    float kernel[5] = float[](0.06, 0.12, 0.24, 0.12, 0.06);

    for (int x = -2; x <= 2; ++x) {
        for (int y = -2; y <= 2; ++y) {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            float sampleDepth = texture(SUN_DEPTH_TEXTURE, proj.xy + offset).r;

            float weight = kernel[x + 2] * kernel[y + 2]; // 2-смещение: kernel[0..4]
            weightSum += weight;

            if (proj.z - bias < sampleDepth) {
                result += weight;
            }
        }
    }

    return result / weightSum;
}

void processDirectionalLight(inout vec3 color) {
  float shadowFactor = sampleShadowPCF(SUN_SHADOW_BIAS, SUN_TEXEL_SIZE);

  float sun_affection = pow(max(dot(v_normal, -SUN_DIRECTION), 0.0), 1.0 / shading_hardness);
  vec3 light_color = SUN_COLOR * sun_affection * shadowFactor;

  float surface_brightness = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;

  color *= SUN_AMBIENT;
  color += light_color * surface_brightness * SUN_ENERGY;
}

void processSpecular(inout vec3 color) {
  if (!specular) return;

  vec3 reflected_sun = reflect(SUN_DIRECTION, v_normal);
  vec3 view_direction = normalize(v_camera_world_position - v_position.xyz);

  float s = pow(max(dot(reflected_sun, view_direction), 0.0), specular_power);

  color += SUN_COLOR * s;
}

// Injected code for additional fragment processing
void fragment(inout vec3 color) {}

void main() {
  vec3 color = albedo_color.rgb;

  fragment(color);

  processDirectionalLight(color);
  processSpecular(color);
  processFog(color);

  outColor = vec4(color, 1.0);
}
