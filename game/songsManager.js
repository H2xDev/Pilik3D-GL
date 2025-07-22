import { pickRandom } from '@core/utils.js';

const html = (string) => string;

const FADE_TIME = 3; // 1 second fade time
const SONG_DURATION = 60 * 5; // 3 minutes song duration
const FADE_PERCENT = FADE_TIME / SONG_DURATION;

/**
  * Takes videos from YouTube by id and plays them in a playlist.
  */
export const SongsManager = new class {
  playlist = [
    'DPAwTqig4_c',
    'tTJdddso9Y4',
    '_egA9RZrD5k',
  ]
  player = null;
  currentIndex = 0;
  currentTime = 0;
  isPlaying = false;
  isReady = false;

  artistRegisty = new Proxy({}, {
    get: (_, id) => {
      const localStorageKey = `track-${id}`;
      const data = localStorage.getItem(localStorageKey) || '';
      if (data) {
        return JSON.parse(data);
      }

      return null;
    },

    set: (_, id, value) => {
      const localStorageKey = `track-${id}`;
      if (value === null) {
        localStorage.removeItem(localStorageKey);
        return true;
      }

      localStorage.setItem(localStorageKey, JSON.stringify(value));
      return true;
    }
  });

  get currentId() {
    return this.playlist[this.currentIndex];
  }

  constructor() {
    document.body.appendChild(
      Object.assign(document.createElement('script'), {
        src: 'https://www.youtube.com/iframe_api',
        onload: () => {
          YT.ready(this.initPlayer.bind(this));
        }
      })
    );

    let oldDeltaTime = 0;
    const process = (timestamp = 0) => {
      oldDeltaTime = oldDeltaTime || timestamp;
      const deltaTime = timestamp - oldDeltaTime;
      oldDeltaTime = timestamp;

      if (!this.isPlaying) return window.requestAnimationFrame(process);

      this.currentTime += deltaTime / 1000;
      const percent = this.currentTime / SONG_DURATION;

      const fadeOut = Math.max(0.0, percent - (1 - FADE_PERCENT)) / FADE_PERCENT;
      const fadeIn = Math.min(1.0, percent / FADE_PERCENT);

      this.player.setVolume(100 * (fadeIn - fadeOut));

      if (this.currentTime >= SONG_DURATION) {
        this.currentTime = 0;
        this.isPlaying = false;
        this.playNext();
      }

      window.requestAnimationFrame(process);
    };

    window.requestAnimationFrame(process);
  }


  initPlayer() {
    this.player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: this.currentId,
      volume: 0,
      events: {
        onReady: (e) => {
          this.isReady = true;
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
          } else if (e.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
          }
        },
      },
    });
  }

  play() {
    this.player.playVideo();
  }
  
  tilVideoPlay() {
    return new Promise(resolve => {
      const handler = ({ data }) => {
        if (data !== YT.PlayerState.PLAYING) return;
        resolve();
        this.player.removeEventListener('onStateChange', handler);
      };

      this.player.addEventListener('onStateChange', handler)
    });
  }

  async playNext() {
    this.player.stopVideo();
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.player.loadVideoById(this.currentId);
    await this.tilVideoPlay();
    const duration = this.player.getDuration() - this.playDuration;
    const randomPos = Math.random() * duration;
    this.player.seekTo(randomPos, true);
    this.currentTime = 0;
    this.showCurrentSong();
  }

  async getSongTitle() {
    const data = this.artistRegisty[this.currentId] || await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${this.currentId}&format=json`)
      .then(res => res.json())
      .then(data => [data.author_name, data.title]);

    if (!this.artistRegisty[this.currentId]) {
      this.artistRegisty[this.currentId] = data;
    }

    return data;
  }

  async showCurrentSong() {
    let [author, title] = await this.getSongTitle();
    title = title.split(' ').slice(0, 6).join(' ');

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for player to be ready

    const div = Object.assign(document.createElement('div'), {
      className: 'current-song',
      innerHTML: html(`
        <div><b>Now Playing<b></div>
        <div style="font-size: 2.0rem">${title}</div>
        <div style="font-size: 1.5rem">by ${author}</div>
        <a
          href="https://www.youtube.com/watch?v=${this.currentId}" 
          target="_blank" 
          rel="noopener noreferrer"
        >Listen on YouTube</a>
      `),
    })

    Object.assign(div.style, {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      top: '10vh',
      width: '100%',
      color: 'black',
      opacity: 0,
      transition: 'opacity 1.0s ease',
      textAlign: 'center',
    });
    document.querySelector('#game').appendChild(div);

    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for the div to be added to the DOM

    div.style.opacity = '1';

    await new Promise(resolve => setTimeout(resolve, 5000)); // Show the song for 5 seconds
    div.style.opacity = '0';
    div.addEventListener('transitionend', () => {
      div.remove();
    }, { once: true });
  }
}
