export const assert = (condition, message) => {
	if (!condition) {
		throw new Error(message || "Assertion failed");
	}
}

export const DEG_TO_RAD = 1 / 180 * Math.PI;

export const getNormal = (a, b, c) => {
  const ab = b.sub(a);
  const ac = c.sub(a);
  return ab.cross(ac).normalized;
}

/**
  * @param { boolean } condition
  * @param { Function } method
  */
export const failed = (condition, method) => {
  if (!condition) {
    method();
    return true;
  }
  return false;
}

export const orhographicProjection = (l, r, t, b, n, f) => [  
2/(r-l),  0,          0,         -(r+l)/(r-l),
0,        2/(t-b),    0,         -(t+b)/(t-b),
0,        0,         -2/(f-n),   -(f+n)/(f-n),
0,        0,          0,          1
]
