import { Vec3, Geometry } from '@core';

export class CylinderGeometry extends Geometry {
  /**
   * @param {number} radius
   * @param {number} height
   * @param {number} segments
   */
  constructor(radius = 1, height = 1, segments = 32) {
    super();

    const h = height / 2;
    const angleStep = (Math.PI * 2) / segments;

    this.vertices = [];
    this.normals = [];
    this.indices = [];

    const topCenterIndex = 0;
    const bottomCenterIndex = 1;

    this.vertices.push(new Vec3(0, h, 0));
    this.normals.push(new Vec3(0, 1, 0));

    this.vertices.push(new Vec3(0, -h, 0));
    this.normals.push(new Vec3(0, -1, 0));

    const topRim = [];
    const bottomRim = [];
    const sideTop = [];
    const sideBottom = [];

    for (let i = 0; i < segments; i++) {
      const angle = i * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const normal = new Vec3(x, 0, z).normalized;

      topRim.push(this.vertices.length);
      this.vertices.push(new Vec3(x, h, z));
      this.normals.push(new Vec3(0, 1, 0));

      bottomRim.push(this.vertices.length);
      this.vertices.push(new Vec3(x, -h, z));
      this.normals.push(new Vec3(0, -1, 0));

      sideTop.push(this.vertices.length);
      this.vertices.push(new Vec3(x, h, z));
      this.normals.push(normal);

      sideBottom.push(this.vertices.length);
      this.vertices.push(new Vec3(x, -h, z));
      this.normals.push(normal);
    }

    for (let i = 0; i < segments; i++) {
      const curr = topRim[i];
      const next = topRim[(i + 1) % segments];
      this.indices.push(topCenterIndex, next, curr);
    }

    for (let i = 0; i < segments; i++) {
      const curr = bottomRim[i];
      const next = bottomRim[(i + 1) % segments];
      this.indices.push(bottomCenterIndex, curr, next);
    }

    for (let i = 0; i < segments; i++) {
      const top1 = sideTop[i];
      const top2 = sideTop[(i + 1) % segments];
      const bottom1 = sideBottom[i];
      const bottom2 = sideBottom[(i + 1) % segments];

      // Первый треугольник
      this.indices.push(top1, top2, bottom1);
      // Второй треугольник
      this.indices.push(top2, bottom2, bottom1);
    }
  }
}
