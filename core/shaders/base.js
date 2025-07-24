export const BASE_DEPTH_FRAGMENT_SHADER = /* glsl */`
precision highp float;

out vec2 outColor;

void main() {
  float depth = gl_FragCoord.z;
  outColor = vec2(depth, depth);
}
`
