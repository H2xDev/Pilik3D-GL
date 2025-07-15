import { Vec3, Color, gl } from './index.js';

export class Geometry {
  /** @type { Vec3[] } */
  vertices = [];

  /** @type { number[] } */
  indices = [];

  /** @type { Vec3[] } */
  normals = [];

  vertexBuffer = gl.createBuffer();
  normalBuffer = gl.createBuffer();
  indexBuffer = gl.createBuffer();

  updateVertexBuffer() {
    const vertices = this.vertices.flatMap(v => v.toArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  }

  updateNormalBuffer() {
    const normals = this.normals.flatMap(n => n.toArray());

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  }

  updateIndexBuffer() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }


  update() {
    this.updateVertexBuffer();
    this.updateNormalBuffer();
    this.updateIndexBuffer();
  }
}
