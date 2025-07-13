const DEFAULT_OPTIONS = {
  loop: false,
  volume: 1.0,
}

export class GSound {
  actx = new AudioContext();
  gain = this.actx.createGain();
  source = this.actx.createBufferSource();
  options = DEFAULT_OPTIONS;

  constructor(src, options = DEFAULT_OPTIONS) {
    Object.assign(this.options, options);

    fetch(src)
      .then(response => response.arrayBuffer())
      .then(data => this.actx.decodeAudioData(data))
      .then(buffer => {
        this.source.buffer = buffer;
        this.source.loop = this.options.loop;
        this.gain.connect(this.actx.destination);
        this.gain.gain.value = this.options.volume;
        this.source.connect(this.gain);
        Object.assign(this.source, options);
      })
  }

  get volume() {
    return this.gain.gain.value;
  }

  set volume(value) {
    this.gain.gain.value = value;
  }

  get loop() {
    return this.source.loop;
  }

  set loop(value) {
    this.source.loop = value;
  }

  set rate(value) {
      this.source.playbackRate.value = value;
  }

  get rate() {
    return this.source.playbackRate.value;
  }


  play() {
    if (this.source.buffer) {
      this.source.start(0);
    } else {
      console.warn("Sound source is not ready yet.");
    }
  }
}
