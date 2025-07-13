import { Camera3D } from './camera3d.js';
import { ShaderMaterial, vertex, fragment } from './shaderMaterial.js';

const vs = vertex`
precision mediump float;

in vec4 VERTEX;
in vec3 NORMAL;

uniform mat4 MODEL_MATRIX;
uniform mat4 PROJECTION;
uniform mat4 INV_CAMERA;

void main() {
  gl_Position = PROJECTION * INV_CAMERA * MODEL_MATRIX * VERTEX;
}
`

const fs = fragment`
precision mediump float;

out vec4 outColor;

void main() {
  outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`


export class BaseMaterial extends ShaderMaterial(vs, fs) {
  applyUniforms() {
    const { current: camera } = Camera3D;
    if (!camera) {
      console.warn("No active camera found. Skipping uniform application.");
      return;
    }

    this.setParameter('INV_CAMERA', camera.globalTransform.inverse.toMat4());
    this.setParameter('PROJECTION', camera.projectionMatrix);

    super.applyUniforms();
  }
}
