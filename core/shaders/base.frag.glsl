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

#include "/core/shaders/shadowPCF.glsl"

void processFog(inout vec3 color) {
  if (!FOG_ENABLED) return;

  float distance = length(v_position.xyz - v_camera_world_position);
  float linear_distance = max(0.0, distance - FOG_DENSITY) / FOG_DENSITY;

  float fog_factor = FOG_TYPE
    ? exp(-FOG_DENSITY * distance)
    : max(0.0, 1.0 - linear_distance);

  color = mix(color, FOG_COLOR, 1.0 - fog_factor);
}

void processDirectionalLight(inout vec3 color) {
  float shadowFactor = shadowPCFBilinear(SUN_DEPTH_TEXTURE, v_depth_texcoord, SUN_TEXEL_SIZE, SUN_SHADOW_BIAS);

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

// CUSTOM FRAGMENT SHADER ============================================================

void fragment(inout vec3 color) {}

// CUSTOM FRAGMENT SHADER END ========================================================

void main() {
  vec3 color = albedo_color.rgb;

  fragment(color);

  processDirectionalLight(color);
  processSpecular(color);
  processFog(color);

  outColor = vec4(color, 1.0);
}
