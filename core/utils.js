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

export const orthographicProjection = (left, right, bottom, top, near, far) => {
  const dst = new Array(16);
  dst[ 0] = 2 / (right - left);
  dst[ 1] = 0;
  dst[ 2] = 0;
  dst[ 3] = 0;
  
  dst[ 4] = 0;
  dst[ 5] = 2 / (top - bottom);
  dst[ 6] = 0;
  dst[ 7] = 0;
  
  dst[ 8] = 0;
  dst[ 9] = 0;
  dst[10] = -2 / (far - near);
  dst[11] = 0;
  
  dst[12] = -(right + left) / (right - left);
  dst[13] = -(top + bottom) / (top - bottom);
  dst[14] = -(far + near) / (far - near);
  dst[15] = 1;

  return dst;
};

export const nextPowerOfTwo = (x) => Math.pow(2, Math.floor(Math.log2(x)));

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
