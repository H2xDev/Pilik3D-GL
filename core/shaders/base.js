export const BASE_VERTEX_SHADER = /* glsl */`
  precision highp float;
  
  in vec3 VERTEX;
  in vec3 NORMAL;
  
  out vec3 v_normal;
  out vec3 v_position;
  out vec3 v_camera_world_position;
  out vec3 v_camera_forward;
  
  uniform mat4 MODEL_MATRIX;
  uniform mat4 PROJECTION;
  uniform mat4 INV_CAMERA;

  void vertex() {}

  void main() {
    mat3 model_basis = mat3(MODEL_MATRIX);
  

    v_normal = normalize(model_basis * NORMAL);
    v_position = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
    v_camera_world_position = inverse(INV_CAMERA)[3].xyz; // Get the camera world position
    v_camera_forward = INV_CAMERA[2].xyz; // Get the camera forward vector

    vertex();
  
    gl_Position = PROJECTION * INV_CAMERA * vec4(v_position, 1.0);
  }
`;

export const BASE_FRAGMENT_SHADER = /* glsl */`
  precision highp float;
  
  out vec4 outColor;

  in vec3 v_normal;
  in vec3 v_position;
  in vec3 v_camera_world_position;
  in vec3 v_camera_forward;
  
  uniform vec3 albedo_color;
  
  // Directional light
  uniform vec3 SUN_COLOR;
  uniform vec3 SUN_DIRECTION;
  uniform vec3 SUN_AMBIENT;
  
  // Fog
  uniform vec3 FOG_COLOR;
  uniform float FOG_DENSITY;
  
  // Specular
  uniform bool specular;
  uniform float specular_power;

  void processFog(inout vec3 color) {
    float distance = length(v_position - v_camera_world_position);
    float fog_factor = exp(-FOG_DENSITY * distance);

    color = mix(color, FOG_COLOR, 1.0 - fog_factor);
  }

  void processDirectionalLight(inout vec3 color) {
    float sun_affection = pow(max(dot(v_normal, -SUN_DIRECTION), 0.0), 2.0);
    vec3 light_color = SUN_COLOR * sun_affection;

    color *= SUN_AMBIENT;
    color += light_color;
  }

  void processSpecular(inout vec3 color) {
    if (!specular) return;

    vec3 reflected_sun = reflect(SUN_DIRECTION, v_normal);
    vec3 view_direction = normalize(v_camera_world_position - v_position);

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
