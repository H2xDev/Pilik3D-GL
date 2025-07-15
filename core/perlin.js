function fract(x) {
  return x - Math.floor(x);
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function hash([x, y]) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function grad(h) {
  const angle = 2 * Math.PI * h;
  return [Math.cos(angle), Math.sin(angle)];
}

function dot2([x1, y1], [x2, y2]) {
  return x1 * x2 + y1 * y2;
}

export function perlin([x, y]) {
  const i = [Math.floor(x), Math.floor(y)];
  const f = [fract(x), fract(y)];

  const h00 = hash([i[0], i[1]]);
  const h10 = hash([i[0] + 1, i[1]]);
  const h01 = hash([i[0], i[1] + 1]);
  const h11 = hash([i[0] + 1, i[1] + 1]);

  const g00 = grad(h00);
  const g10 = grad(h10);
  const g01 = grad(h01);
  const g11 = grad(h11);

  const n00 = dot2(g00, [f[0], f[1]]);
  const n10 = dot2(g10, [f[0] - 1, f[1]]);
  const n01 = dot2(g01, [f[0], f[1] - 1]);
  const n11 = dot2(g11, [f[0] - 1, f[1] - 1]);

  const u = fade(f[0]);
  const v = fade(f[1]);

  return ((1 - v) * ((1 - u) * n00 + u * n10) +
          v * ((1 - u) * n01 + u * n11));
}
