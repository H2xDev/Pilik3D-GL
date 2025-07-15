import { Geometry } from '@core/geometry.js';
import { Color } from '../color.js';
import { Vec3 } from '../vec3.js';

export class BoxGeometry extends Geometry {
  /**
   * @param {number} width 
   * @param {number} height 
   * @param {number} depth 
   * @param {Color | Color[]} color 
   */
  constructor(width = 1, height = 1, depth = 1, color = Color.WHITE) {
    super();

    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;

    // Вершины (24 уникальных для корректных нормалей и UV/цветов)
    this.vertices = [
      // Front face
      new Vec3(-w, -h,  d), new Vec3( w, -h,  d), new Vec3( w,  h,  d), new Vec3(-w,  h,  d),
      // Back face
      new Vec3( w, -h, -d), new Vec3(-w, -h, -d), new Vec3(-w,  h, -d), new Vec3( w,  h, -d),
      // Top face
      new Vec3(-w,  h,  d), new Vec3( w,  h,  d), new Vec3( w,  h, -d), new Vec3(-w,  h, -d),
      // Bottom face
      new Vec3(-w, -h, -d), new Vec3( w, -h, -d), new Vec3( w, -h,  d), new Vec3(-w, -h,  d),
      // Right face
      new Vec3( w, -h,  d), new Vec3( w, -h, -d), new Vec3( w,  h, -d), new Vec3( w,  h,  d),
      // Left face
      new Vec3(-w, -h, -d), new Vec3(-w, -h,  d), new Vec3(-w,  h,  d), new Vec3(-w,  h, -d),
    ];

    // Нормали
    this.normals = [
      // Front
      ...Array(4).fill(new Vec3(0, 0, 1)),
      // Back
      ...Array(4).fill(new Vec3(0, 0, -1)),
      // Top
      ...Array(4).fill(new Vec3(0, 1, 0)),
      // Bottom
      ...Array(4).fill(new Vec3(0, -1, 0)),
      // Right
      ...Array(4).fill(new Vec3(1, 0, 0)),
      // Left
      ...Array(4).fill(new Vec3(-1, 0, 0)),
    ];

    // Индексы
    this.indices = [
      // Front
      0, 1, 2,   0, 2, 3,
      // Back
      4, 5, 6,   4, 6, 7,
      // Top
      8, 9,10,   8,10,11,
      // Bottom
     12,13,14,  12,14,15,
      // Right
     16,17,18,  16,18,19,
      // Left
     20,21,22,  20,22,23,
    ];

    this.update();
  }
}
