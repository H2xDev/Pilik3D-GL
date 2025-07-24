export * from './gl.js';
export * from './math/mat4.js';
export * from './math/vec3.js';
export * from './math/vec2.js';
export * from './math/basis.js';
export * from './math/color.js';
export * from './gnode.js';
export * from './node3d.js';
export * from './camera3d.js';
export * from './directionalLight.js';
export * from './light.js';
export * from './fog.js';
export * from './geometry.js';
export * from './perlin.js';
export * from './transform3d.js';
export * from './tween.js';
export * from './utils.js';
export * from './uuid.js';
export * from './input.js';
export * from './sound.js';
export * from './aabb.js';
export * from './shadersManager.js';
export * from './shaderMaterial.js';
export * from './baseMaterial.js';
export * from './mesh.js';
export * from './scene.js';
export * from './debugger.js';
export * from './stateMachine.js';
export * from './resourceManager.js';
export * from './gameLoop.js';

import { defineSpatialMaterial } from './baseMaterial.js';
import { ShadersManager } from './shadersManager.js';
import { ResourceManager } from './resourceManager.js';
import { GameLoop } from './gameLoop.js';


/**
  * @param { Parameters<import('./gameLoop.js').GameLoop['setup']>[0] } options
  * @param { HTMLElement } elementMountTo - The HTML element to mount the game loop to.
  * @param { () => Promise<void> | void } preload - A function to preload resources before starting the game loop.
  */
export const init = async (elementMountTo, options, preload = () => {}) => {
  await ShadersManager.preload(
    '/core/shaders/shadowPCF.glsl',
    '/core/shaders/base.vert.glsl',
    '/core/shaders/base.frag.glsl',
  )

  const BaseMaterial = defineSpatialMaterial();
  ResourceManager.define('BaseMaterial', BaseMaterial);

  await preload();

  return new GameLoop()
    .setup(options)
    .mountTo(elementMountTo)
}
