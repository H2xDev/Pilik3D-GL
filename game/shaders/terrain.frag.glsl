  void fragment(inout vec3 color) {
    float cz = v_position.z + sin(v_position.x * 5.0) * 0.1;

    float dist = length(v_position.xz);
    float direction = atan(v_position.z, v_position.x);

    float wave = pow(sin((cz + v_position.x) * 20.0), 2.0) * 0.5 + 0.5;
    float wave_affect = 1.0 - pow(max(0.0, dot(vec3(0.0, 1.0, 0.0), v_normal)), 10.0);

    color = mix(color, color * 0.8, wave * wave_affect);
  }
