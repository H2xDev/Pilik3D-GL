import { AABB } from "./aabb.js";
import { GNode3D, gl } from "./index.js";

/**
  * @typedef { InstanceType<ReturnType<import('./shaderMaterial.js').ShaderMaterial>> } Material
  */

export class Mesh extends GNode3D {
  static DEFAULT_MATERIAL = null;

  /**
    * @param { import('./index.js').Geometry } geometry_
    */
  geometry_ = null;

  /**
    * @type { InstanceType<ReturnType<import('./shaderMaterial.js').ShaderMaterial>> | null }
    */
  material = null;

  /**
    * @type { AABB | null }
    */
  aabb = null;

  backfaceCulling = true;
  smoothShading = true;
  wireframe = false;
  vao = gl.createVertexArray();

  set geometry(geometry_) {
    if (this.geometry_ === geometry_) return;
    this.geometry_ = geometry_;
    this.setup();
  }

  get geometry() {
    return this.geometry_;
  }

  /**
    * @param { import('./index.js').Geometry } geometry_
    * @param { Material } material
    */
  constructor(geometry_, material) {
    super();
    Object.assign(this, { geometry_, material });
    if (geometry_) this.setup();
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

    const size = this.geometry.maxPosition.sub(this.geometry.minPosition);
    const center = this.geometry.minPosition.add(size.mul(0.5));

    this.aabb = new AABB(size, center);
  }

  /**
    * Renders the mesh using the provided material.
    * @param { Material } material The material to use for rendering the mesh.
    * @returns { boolean } Returns true if the mesh was rendered, false otherwise.
    */
  render(material) {
    // Here should be current camera to render (even the sun)
    if (!this.aabb.isInCamera(this.globalTransform)) return false;
    if (!material) return false;

    const renderType = this.wireframe ? gl.LINES : gl.TRIANGLES;
    material.setParameter("MODEL_MATRIX", this.globalTransform.toMat4());

    if (this.backfaceCulling) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
    }

    gl.bindVertexArray(this.vao);
    gl.drawElements(renderType, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);

    return true;
  }

  _render() {
    this.material.applyUniforms();
    this.render(this.material);

    super._render();
  }
}
