import { BaseMaterial, GNode3D, gl } from "./index.js";

export class Mesh extends GNode3D {
  static DEFAULT_MATERIAL = null;

  geometry_ = null;

  /**
    * @type { import('./baseMaterial.js').BaseMaterial | null }
    */
  material = null;
  backfaceCulling = true;
  smoothShading = true;

  vao = gl.createVertexArray();

  wireframe = false;

  set geometry(geometry_) {
    if (this.geometry_ === geometry_) return;
    this.geometry_ = geometry_;
    this.setup();
  }

  get geometry() {
    return this.geometry_;
  }

  /**
    * @param { import('./geometry.js').Geometry } geometry_
    * @param { import('./baseMaterial.js').BaseMaterial } material
    */
  constructor(geometry_, material) {
    super();
    Mesh.DEFAULT_MATERIAL ??= new BaseMaterial();
    material ??= Mesh.DEFAULT_MATERIAL;

    Object.assign(this, { geometry_, material });
    if (geometry_) this.setup();
  }

  /**
    * @deprecated
    */
  assignGeometry(geometry_) {
    this.geometry = geometry_;
    return this;
  }

  cleanupAttributes() {
    gl.bindVertexArray(this.vao);
    gl.disableVertexAttribArray(this.material.attributes.VERTEX);
    if (this.material.attributes.NORMAL) {
      gl.disableVertexAttribArray(this.material.attributes.NORMAL);
    }
  }

  setup() {
    this.geometry.update();
    this.cleanupAttributes();

    gl.bindVertexArray(this.vao);

    gl.enableVertexAttribArray(this.material.attributes.VERTEX);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
    gl.vertexAttribPointer(this.material.attributes.VERTEX, 3, gl.FLOAT, false, 0, 0);

    if (this.material.attributes.NORMAL) {
      gl.enableVertexAttribArray(this.material.attributes.NORMAL);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.normalBuffer);
      gl.vertexAttribPointer(this.material.attributes.NORMAL, 3, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.indexBuffer);

    gl.bindVertexArray(null);
  }

  renderMesh() {
    gl.bindVertexArray(this.vao);
    this.material.applyUniforms();
    this.material.setParameter("MODEL_MATRIX", this.globalTransform.toMat4());
    const renderType = this.wireframe ? gl.LINES : gl.TRIANGLES;
    gl.drawElements(renderType, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
    gl.useProgram(null);
  }

  renderDepth() {
    gl.bindVertexArray(this.vao);
    this.material.depthPass.applyUniforms();
    this.material.depthPass.setParameter("MODEL_MATRIX", this.globalTransform.toMat4());
    gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
  }


  process() {
    this.renderDepth();
    this.renderMesh();
  }
}
