import { GameLoop, ShadersManager } from '@core/index.js';

const beginGame = ({ Game }) => new GameLoop()
    .setup({
      width: window.innerWidth,
      height: window.innerHeight,
      style: {
        width: '100%',
        height: '100%',
        display: 'block',
        margin: '0 auto',
        backgroundColor: '#000'
      }
    })
    .mountTo(document.body)
    .changeScene(Game).then(loop => loop.begin());

ShadersManager.instance
  .preload(
    '/game/shaders/terrain.vert.glsl',
    '/game/shaders/terrain.frag.glsl',
  )
  .then(() => import('/game/index.js'))
  .then(beginGame);
