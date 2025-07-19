import { GameLoop, ShadersManager, til } from '@core/index.js';
import { SongsManager } from '/game/songsManager.js';

const ASPECT_RATIO = 21/9;
const WIDTH = window.innerWidth / ASPECT_RATIO > window.innerHeight
  ? window.innerHeight * ASPECT_RATIO
  : window.innerWidth;

const HEIGHT = window.innerWidth / ASPECT_RATIO > window.innerHeight
  ? window.innerHeight
  : window.innerWidth / ASPECT_RATIO;

const beginGame = ({ Game }) => new GameLoop()
    .setup({
      width: WIDTH,
      height: HEIGHT,
      style: {
        aspectRatio: ASPECT_RATIO,
        width: '100%',
        height: '100%',
        margin: 'auto',
        position: 'absolute',
        display: 'block',
        inset: 0,
        backgroundColor: '#000'
      }
    })
    .mountTo(document.body.querySelector('#game'))
    .changeScene(Game).then(loop => loop.begin());

ShadersManager
  .preload(
    '/game/shaders/terrain.vert.glsl',
    '/game/shaders/terrain.frag.glsl',
  )
  .then(() => til(() => SongsManager.isReady))
  .then(() => import('/game/index.js'))
  .then(beginGame);
