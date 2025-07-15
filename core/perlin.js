function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function fract(x) {
  return x - Math.floor(x);
}

function floorVec2([x, y]) {
  return [Math.floor(x), Math.floor(y)];
}

function fractVec2([x, y]) {
  return [fract(x), fract(y)];
}

function dot2([x1, y1], [x2, y2]) {
  return x1 * x2 + y1 * y2;
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}

function hash([x, y]) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function grad2(h) {
  const angle = 2 * Math.PI * h;
  return [Math.cos(angle), Math.sin(angle)];
}

export function perlin([x, y]) {
  const i = floorVec2([x, y]);
  const f = fractVec2([x, y]);

  const u = [fade(f[0]), fade(f[1])];

  const h00 = hash([i[0] + 0, i[1] + 0]);
  const h10 = hash([i[0] + 1, i[1] + 0]);
  const h01 = hash([i[0] + 0, i[1] + 1]);
  const h11 = hash([i[0] + 1, i[1] + 1]);

  const g00 = grad2(h00);
  const g10 = grad2(h10);
  const g01 = grad2(h01);
  const g11 = grad2(h11);

  const n00 = dot2(g00, [f[0] - 0, f[1] - 0]);
  const n10 = dot2(g10, [f[0] - 1, f[1] - 0]);
  const n01 = dot2(g01, [f[0] - 0, f[1] - 1]);
  const n11 = dot2(g11, [f[0] - 1, f[1] - 1]);

  const nx0 = mix(n00, n10, u[0]);
  const nx1 = mix(n01, n11, u[0]);
  const nxy = mix(nx0, nx1, u[1]);

  return nxy;
}
