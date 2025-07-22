import { Geometry, Vec3 } from "@core";

export class OBJImporter extends Geometry {
  /**
    * @param { string } data - The OBJ file content as a string.
    */
  constructor(data) {
    super();
    const rawNormals = [];
    data.split('\n').forEach(line => {
      const [marker, ...args] = line.trim().split(/\s+/);

      switch (marker) {
        case 'v': // Vertex
          const v = new Vec3(...args.slice(0, 3).map(Number));
          this.vertices.push(v);
          break;

        case 'vn': // Vertex normal
          const normal = new Vec3(...args.map(Number));
          rawNormals.push(normal);
          break;

        case 'f': // Face
          const vindices = args.map(arg => arg.split('/')[0]).map(Number).map(i => i - 1); // OBJ indices are 1-based
          const nindices = args.map(arg => arg.split('/')[2]).map(Number).map(i => i - 1); // OBJ normals are also 1-based

          const has4Vertices = vindices.length === 4;

          if (has4Vertices) {
            // Split quad into two triangles
            this.indices.push(vindices[0], vindices[1], vindices[2]);
            this.indices.push(vindices[0], vindices[2], vindices[3]);
            this.normals[vindices[0]] = rawNormals[nindices[0]];
            this.normals[vindices[1]] = rawNormals[nindices[1]];
            this.normals[vindices[2]] = rawNormals[nindices[2]];
            this.normals[vindices[3]] = rawNormals[nindices[3]];
          } else {
            this.indices.push(...vindices);
            this.normals[vindices[0]] = rawNormals[nindices[0]];
            this.normals[vindices[1]] = rawNormals[nindices[1]];
            this.normals[vindices[2]] = rawNormals[nindices[2]];
          }
          break;

        default: break;
      }
    })
  }
}
