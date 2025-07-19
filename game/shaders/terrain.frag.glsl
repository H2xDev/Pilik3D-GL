in float road_value;
in float road_x;

void fragment(inout vec3 color) {
  float cz = v_position.z + sin(v_position.x * 5.0) * 0.1;

  float dist = length(v_position.xz);
  float direction = atan(v_position.z, v_position.x);

  float wave = pow(sin((cz + v_position.x) * 20.0), 2.0) * 0.5 + 0.5;
  float wave_affect = 1.0 - pow(max(0.0, dot(vec3(0.0, 1.0, 0.0), v_normal)), 10.0);

  float distance = 0.02;
  float line_width = 0.02;
  float line_factor = 1.0 - min(abs(v_position.x - (road_x - distance) * 2.0) / line_width, 1.0);
  float line_factor2 = 1.0 - min(abs(v_position.x - (road_x + distance) * 2.0) / line_width, 1.0);
  vec3 line_color = vec3(1.0, 0.6, 0.0) * 0.5;

  color = mix(color, color * 0.8, wave * wave_affect);
  color = mix(color, vec3(0.2), road_value);
  color = mix(color, line_color, line_factor);
  color = mix(color, line_color, line_factor2);
}
