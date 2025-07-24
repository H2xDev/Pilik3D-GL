import * as Pilik from '@core';
import { SongsManager } from '/game/songsManager.js';


const CONFIG = {
  width: window.innerWidth,
  height: window.innerHeight,

  /**
    * @type { Partial<CSSStyleDeclaration> }
    */
  style: {
    width: '100%',
    height: '100%',
    margin: 'auto',
    position: 'absolute',
    display: 'block',
    inset: '0',
    backgroundColor: '#000'
  }
}


const preload =  async () => {
  await Pilik.ShadersManager.preload(
    '/game/shaders/noise.glsl',
    '/game/shaders/terrain.vert.glsl',
    '/game/shaders/terrain.frag.glsl',
  )
  await Pilik.til(() => SongsManager.isReady);
}

Pilik
  .init(document.body.querySelector('#game'), CONFIG, preload)
  .then(gameLoop => Promise.all([gameLoop, import('/game/index.js')]))
  .then(([gameLoop, { Game }]) => gameLoop.changeScene(Game))
  .then(loop => loop.begin());

