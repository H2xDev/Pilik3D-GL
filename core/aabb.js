import { Vec3 } from './vec3.js';

const AABB_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7]
];

export class AABB {
  size = new Vec3(1, 1, 1);
  center = new Vec3(0, 0, 0);

  get vertices() {
    const halfSize = this.size.mul(0.5);
    return [
      new Vec3(this.center.x - halfSize.x, this.center.y - halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y - halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y + halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y + halfSize.y, this.center.z - halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y - halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y - halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x + halfSize.x, this.center.y + halfSize.y, this.center.z + halfSize.z),
      new Vec3(this.center.x - halfSize.x, this.center.y + halfSize.y, this.center.z + halfSize.z)
    ];
  }

  /**
    * @param { import('./camera3d').Camera3D } camera3d
    * @param { import('./geometryNode').GeometryNode } node
    * @param { import('./color.js').Color } color
    */
  static renderAABB(camera3d, node, color) {
    const points = node.aabb.vertices
      .map(point => point.mul(node.globalScale).add(node.globalPosition));

    AABB_EDGES.forEach(([start, end]) => {
      camera3d.drawLine(points[start], points[end], color, true);
    });
    camera3d.drawCircle(node.globalPosition, 4, color);
  }
}
