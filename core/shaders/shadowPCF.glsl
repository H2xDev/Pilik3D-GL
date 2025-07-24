float shadowPCFBilinear(sampler2D shadowMap, vec4 v_depth_texcoord, float texelSize, float bias) {
  vec3 proj = v_depth_texcoord.xyz / v_depth_texcoord.w;
  proj = proj * 0.5 + 0.5;

  if (proj.x < 0.0 || proj.x > 1.0 ||
      proj.y < 0.0 || proj.y > 1.0 ||
      proj.z < 0.0 || proj.z > 1.0)
    return 1.0;

  vec2 uv = proj.xy / texelSize;
  vec2 base = floor(uv - 0.5);
  vec2 f = fract(uv - 0.5);

  float shadow = 0.0;

  for (int y = 0; y <= 1; y++) {
    for (int x = 0; x <= 1; x++) {
      vec2 offset = vec2(x, y);
      vec2 sampleUV = (base + offset) * texelSize;

      float depth = texture(shadowMap, sampleUV).r;
      float weight = (1.0 - abs(float(x) - f.x)) * (1.0 - abs(float(y) - f.y));
      shadow += weight * step(proj.z - bias, depth);
    }
  }

  return shadow;
}
