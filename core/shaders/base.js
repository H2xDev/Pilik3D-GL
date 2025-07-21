export const BASE_DEPTH_FRAGMENT_SHADER = /* glsl */`
  precision highp float;

  void main() {
  }
`

export const DEBUG_DEPTH_FRAGMENT_SHADER = /* glsl */`
  precision highp float;
  in vec4 v_position_clip_space;

  out vec4 outColor;

  void main() {
    vec3 ndc = v_position_clip_space.xyz / v_position_clip_space.w;
    ndc = ndc * 0.5 + 0.5;
    float depth = ndc.z;
    outColor = vec4(vec3(depth), 1.0);
  }
`

export const BASE_VERTEX_SHADER = /* glsl */`
  #define SHADOW_PASS false

  precision highp float;
  
  in vec4 VERTEX;
  in vec3 NORMAL;
  
  out vec3 v_normal;
  out vec4 v_position;
  out vec4 v_position_clip_space;
  out vec3 v_camera_world_position;
  out vec3 v_camera_forward;
  out vec4 v_depth_texcoord;
  
  uniform mat4 MODEL_MATRIX;
  uniform mat4 PROJECTION;
  uniform mat4 CAMERA_VIEW_MATRIX;

  uniform mat4 SUN_VIEW_MATRIX;
  uniform mat4 SUN_PROJECTION;

  void vertex() {}

  void main() {
    mat3 model_basis = mat3(MODEL_MATRIX);
    v_camera_world_position = inverse(CAMERA_VIEW_MATRIX)[3].xyz;
    v_camera_forward = CAMERA_VIEW_MATRIX[2].xyz;
    v_normal = normalize(model_basis * NORMAL);
    v_position = MODEL_MATRIX * VERTEX;

    vertex();

    v_position_clip_space = PROJECTION * CAMERA_VIEW_MATRIX * v_position;
    v_depth_texcoord = SUN_PROJECTION * SUN_VIEW_MATRIX * v_position;

    gl_Position = v_position_clip_space;
  }
`;

export const BASE_FRAGMENT_SHADER = /* glsl */`
  precision highp float;
  
  out vec4 outColor;

  uniform sampler2D SUN_DEPTH_TEXTURE;

  in vec3 v_normal;
  in vec4 v_position;
  in vec3 v_camera_world_position;
  in vec3 v_camera_forward;
  in vec4 v_position_clip_space;
  in vec4 v_depth_texcoord;
  
  uniform vec3 albedo_color;
  uniform float shading_hardness;
  
  // Directional light
  uniform vec3 SUN_COLOR;
  uniform vec3 SUN_DIRECTION;
  uniform vec3 SUN_AMBIENT;
  uniform float SUN_ENERGY;
  
  // Fog
  uniform vec3 FOG_COLOR;
  uniform float FOG_DENSITY;
  uniform bool FOG_TYPE;
  
  // Specular
  uniform bool specular;
  uniform float specular_power;

  void processFog(inout vec3 color) {
    float distance = length(v_position.xyz - v_camera_world_position);
    float linear_distance = max(0.0, distance - FOG_DENSITY) / FOG_DENSITY;

    float fog_factor = FOG_TYPE
      ? exp(-FOG_DENSITY * distance)
      : max(0.0, 1.0 - linear_distance);

    color = mix(color, FOG_COLOR, 1.0 - fog_factor);
  }

  float sampleShadowPCF(float bias, float texelSize) {
      vec3 proj = v_depth_texcoord.xyz / v_depth_texcoord.w;
      proj = proj * 0.5 + 0.5; // Convert from NDC to [0, 1] range

      // За пределами shadow map — не в тени
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
    float shadowFactor = sampleShadowPCF(0.0007, 1.0 / 16384.0);

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
`
