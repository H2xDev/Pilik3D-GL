export const getFrictionRate = (friction, deltaTime) => {
  return 1 / (1 + friction * deltaTime);
}

export const getAcceleration = (targetSpeed, friction, deltaTime) => {
  if (!deltaTime || deltaTime <= 0) return 0;
  const frictionRate = getFrictionRate(friction, deltaTime);
  return ((targetSpeed / deltaTime / frictionRate) - (targetSpeed / deltaTime)) / 2.0;
}

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
