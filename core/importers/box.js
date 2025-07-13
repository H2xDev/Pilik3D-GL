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

    const faceNormals = [
      new Vec3(0, 0, -1), // front
      new Vec3(0, 0, 1),  // back
      new Vec3(0, -1, 0), // bottom
      new Vec3(0, 1, 0),  // top
      new Vec3(-1, 0, 0), // left
      new Vec3(1, 0, 0)   // right
    ];

    const faceTriangles = [
      // front
      [ new Vec3(-w, -h, -d), new Vec3(w, -h, -d), new Vec3(w, h, -d) ],
      [ new Vec3(-w, -h, -d), new Vec3(w, h, -d), new Vec3(-w, h, -d) ],

      // back
      [ new Vec3(w, -h, d), new Vec3(-w, -h, d), new Vec3(-w, h, d) ],
      [ new Vec3(w, -h, d), new Vec3(-w, h, d), new Vec3(w, h, d) ],

      // bottom
      [ new Vec3(-w, -h, d), new Vec3(w, -h, d), new Vec3(w, -h, -d) ],
      [ new Vec3(-w, -h, d), new Vec3(w, -h, -d), new Vec3(-w, -h, -d) ],

      // top
      [ new Vec3(-w, h, -d), new Vec3(w, h, -d), new Vec3(w, h, d) ],
      [ new Vec3(-w, h, -d), new Vec3(w, h, d), new Vec3(-w, h, d) ],

      // left
      [ new Vec3(-w, -h, d), new Vec3(-w, -h, -d), new Vec3(-w, h, -d) ],
      [ new Vec3(-w, -h, d), new Vec3(-w, h, -d), new Vec3(-w, h, d) ],

      // right
      [ new Vec3(w, -h, -d), new Vec3(w, -h, d), new Vec3(w, h, d) ],
      [ new Vec3(w, -h, -d), new Vec3(w, h, d), new Vec3(w, h, -d) ]
    ];

    const useColors = [];

    if (Array.isArray(color)) {
      if (color.length !== 12) {
        throw new Error(`BoxGeometry expects 12 colors, got ${color.length}`);
      }
      useColors.push(...color);
    } else {
      for (let i = 0; i < 12; i++) useColors.push(color);
    }

    for (let i = 0; i < 12; i++) {
      const tri = faceTriangles[i];
      const normal = faceNormals[Math.floor(i / 2)];
      const baseIndex = i * 3;

      this.vertices.push(...tri);
      this.normals.push(normal, normal, normal);
      this.indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
    }
  }
}
