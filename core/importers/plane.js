import { Vec3, Color, Geometry } from '@core';

export class PlaneGeometry extends Geometry {
  constructor(sx, sy, fromCenter = false) {
    super();

    const halfWidth = sx / 2;
    const halfHeight = sy / 2;

    for (let y = 0; y < sy; y++) {
      for (let x = 0; x < sx; x++) {
        // Четыре угловые вершины
        const i0 = new Vec3(x,     0, y);
        const i1 = new Vec3(x + 1, 0, y);
        const i2 = new Vec3(x + 1, 0, y + 1);
        const i3 = new Vec3(x,     0, y + 1);
        const center = new Vec3(x + 0.5, 0, y + 0.5);

        if (fromCenter) {
          for (const v of [i0, i1, i2, i3, center]) {
            v.x -= halfWidth;
            v.z -= halfHeight;
          }
        }

        const base = this.vertices.length;
        this.vertices.push(i0, i1, i2, i3, center);

        const vi0 = base + 0;
        const vi1 = base + 1;
        const vi2 = base + 2;
        const vi3 = base + 3;
        const vc  = base + 4;

        // 4 треугольника (звезда)
        this.indices.push(vi0, vi1, vc);
        this.indices.push(vi1, vi2, vc);
        this.indices.push(vi2, vi3, vc);
        this.indices.push(vi3, vi0, vc);
      }
    }

    // Normals — вверх
    this.normals = Array(this.vertices.length).fill(new Vec3(0, 1, 0));
    this.colors = Array(this.vertices.length).fill(Color.WHITE);
  }
}
