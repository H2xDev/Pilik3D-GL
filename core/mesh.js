import { GNode3D, gl } from "./index.js";

export class Mesh extends GNode3D {
  geometry = null;
  material = null;

  vao = gl.createVertexArray();

  /**
    * @param { import('./geometry.js').Geometry } geometry
    * @param { import('./baseMaterial.js').BaseMaterial } material
    */
  constructor(geometry, material) {
    super();
    Object.assign(this, { geometry, material });

    geometry.update();

    gl.bindVertexArray(this.vao);
    gl.useProgram(this.material.program);

    gl.enableVertexAttribArray(this.material.attributes.VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
    gl.vertexAttribPointer(this.material.attributes.VERTEX, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(this.material.attributes.NORMAL);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.normalBuffer);
    gl.vertexAttribPointer(this.material.attributes.NORMAL, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.indexBuffer);


    gl.bindVertexArray(null);
  }

  process(dt) {
    gl.useProgram(this.material.program);
    this.material.applyUniforms();
    this.material.setParameter("MODEL_MATRIX", this.globalTransform.toMat4());

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }
}
