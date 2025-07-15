export const perm = new Uint8Array(512);

(function initPermTable() {
  const seed = 1337;
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const r = (seed * (i + 1)) % 256;
    [p[i], p[r]] = [p[r], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i % 256];
})();

const grad2 = [
  [ 1, 0], [-1, 0], [ 0, 1], [ 0, -1],
  [ 1, 1], [-1, 1], [ 1, -1], [-1, -1]
];

(function initPermTable() {
  const seed = 1337;
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const r = (seed * (i + 1)) % 256;
    [p[i], p[r]] = [p[r], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i % 256];
})();

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function dot2([gx, gy], [x, y]) {
  return gx * x + gy * y;
}

export function perlin([x, y]) {
  x /= 10.0;
  y /= 10.0;
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[xi] + yi] % 8;
  const ab = perm[perm[xi] + yi + 1] % 8;
  const ba = perm[perm[xi + 1] + yi] % 8;
  const bb = perm[perm[xi + 1] + yi + 1] % 8;

  const x1 = dot2(grad2[aa], [xf,     yf]);
  const x2 = dot2(grad2[ba], [xf - 1, yf]);
  const y1 = dot2(grad2[ab], [xf,     yf - 1]);
  const y2 = dot2(grad2[bb], [xf - 1, yf - 1]);

  const nx0 = x1 + u * (x2 - x1);
  const nx1 = y1 + u * (y2 - y1);
  return Math.pow(nx0 + v * (nx1 - nx0), 4) * 10.0;
}
