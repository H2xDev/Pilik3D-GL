import { Vec3 } from '../vec3.js';
import { Geometry } from '../geometry.js';

export class CylinderGeometry extends Geometry {
  constructor(radius = 1, height = 2, radialSegments = 8, offset = Vec3.ZERO) {
    super();
    this.radius = radius;
    this.height = height;
    this.radialSegments = radialSegments;

    for (let i = 0; i <= radialSegments; i++) {
      const theta = (i / radialSegments) * Math.PI * 2;
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      this.vertices.push(new Vec3(x, height / 2, z).sub(offset));
      this.vertices.push(new Vec3(x, -height / 2, z).sub(offset));
      this.normals.push(new Vec3(x, 0, z).normalized);
      this.normals.push(new Vec3(x, 0, z).normalized);
    }

    // Create indices for the side faces
    for (let i = 0; i < radialSegments; i++) {
      const topIndex = i * 2;
      const bottomIndex = topIndex + 1;
      const nextTopIndex = ((i + 1) % radialSegments) * 2;
      const nextBottomIndex = nextTopIndex + 1;

      // Side face
      this.indices.push(topIndex, bottomIndex, nextTopIndex);
      this.indices.push(nextTopIndex, bottomIndex, nextBottomIndex);
    }

    const topCenterIndex = this.vertices.length; // Index for the top center vertex
    const bottomCenterIndex = topCenterIndex + 1; // Index for the bottom center vertex

    // Close top and bottom faces
    for (let i = 0; i < this.vertices.length - 2; i += 2) {
      const topIndex = i;
      const nextTopIndex = (i + 2) % (this.vertices.length);
      const bottomIndex = i + 1;
      const nextBottomIndex = (i + 3) % (this.vertices.length);

      this.indices.push(topCenterIndex, topIndex, nextTopIndex);
      this.indices.push(bottomCenterIndex, bottomIndex, nextBottomIndex);
    }

    this.vertices.push(new Vec3(0, height / 2, 0).sub(offset)); // Top center vertex
    this.vertices.push(new Vec3(0, -height / 2, 0).sub(offset)); // Bottom center vertex
    this.normals.push(new Vec3(0, 1, 0)); // Normal for top center vertex
    this.normals.push(new Vec3(0, -1, 0)); // Normal for bottom center vertex
  }
}
