import { Vec3, Transform3D } from "@core";

export class Mat4 {
  static multiply(a, b) {
    const result = new Array(16);
    for (let i = 0; i < 4; i++) { // row
      for (let j = 0; j < 4; j++) { // column
        result[j * 4 + i] =
          a[0 * 4 + i] * b[j * 4 + 0] +
          a[1 * 4 + i] * b[j * 4 + 1] +
          a[2 * 4 + i] * b[j * 4 + 2] +
          a[3 * 4 + i] * b[j * 4 + 3];
      }
    }
    return result;
  }

  static toTransform(mat) {
    const transform = new Transform3D();
    transform.basis.set(
      mat[0], mat[1], mat[2],
      mat[4], mat[5], mat[6],
      mat[8], mat[9], mat[10]
    );
    transform.position.set(mat[12], mat[13], mat[14]);
    transform.scale.set(
      Math.sqrt(mat[0] * mat[0] + mat[1] * mat[1] + mat[2] * mat[2]),
      Math.sqrt(mat[4] * mat[4] + mat[5] * mat[5] + mat[6] * mat[6]),
      Math.sqrt(mat[8] * mat[8] + mat[9] * mat[9] + mat[10] * mat[10])
    );
    return transform;
  }

  /**
    * @param { Array } mat
    * @param { Vec3 } vec
    */
  static transformVec3(mat, vec) {
    const x = mat[0] * vec.x + mat[4] * vec.y + mat[8] * vec.z + mat[12];
    const y = mat[1] * vec.x + mat[5] * vec.y + mat[9] * vec.z + mat[13];
    const z = mat[2] * vec.x + mat[6] * vec.y + mat[10] * vec.z + mat[14];
    const w = mat[3] * vec.x + mat[7] * vec.y + mat[11] * vec.z + mat[15];

    return new Vec3(x / w, y / w, z / w);
  }
}
