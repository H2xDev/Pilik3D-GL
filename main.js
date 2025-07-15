import { GameLoop } from '@core/index.js';
import { Game } from '/game/index.js';

new GameLoop()
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
