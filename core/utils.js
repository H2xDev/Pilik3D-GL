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

/**
  * Waits until a condition is met, checking it on each animation frame.
  * @param { () => boolean } conditionGetter - A function that returns a boolean indicating whether the condition is met.
  */
export const til = (conditionGetter) => {
  return new Promise((resolve) => {
    const checkCondition = () => {
      if (conditionGetter()) {
        resolve();
      } else {
        requestAnimationFrame(checkCondition);
      }
    };
    checkCondition();
  });
}


/**
  * Returns a random element from the given array.
  */
export const pickRandom = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("pickRandom: Argument must be a non-empty array");
  }
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}
