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
