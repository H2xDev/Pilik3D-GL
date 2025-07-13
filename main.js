import { GameLoop } from '@core/index.js';
import { Game } from '/game/index.js';

new GameLoop()
  .setup({
    width: 800,
    height: 600,
    style: {
      width: '100%',
      height: '100%',
      display: 'block',
      margin: '0 auto',
      backgroundColor: '#000'
    }
  })
  .mountTo(document.body)
  .changeScene(Game)
  .begin();
