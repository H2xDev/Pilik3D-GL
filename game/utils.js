export const getFrictionRate = (friction, deltaTime) => {
  return 1 / (1 + friction * deltaTime);
}

export const getAcceleration = (targetSpeed, friction, deltaTime) => {
  if (!deltaTime || deltaTime <= 0) return 0;
  const frictionRate = getFrictionRate(friction, deltaTime);
  return ((targetSpeed / deltaTime / frictionRate) - (targetSpeed / deltaTime)) / 2.0;
}
