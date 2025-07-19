export const Tween = new class Tween {
  /**
    * Starts a tween animation that runs for a specified duration.
    * @param { number } duration - Te duration of the tween in milliseconds.
    * @param { (progress: number, dt: number) => void } callback - A function that will be called with the progress of the tween, where 0 is the start and 1 is the end.
    */
  begin(duration, callback) {
    return new Promise((resolve) => {
      let elapsed = 0;
      let oldTimestamp = 0;

      /**
        * Handles the animation frame updates.
        * @param { number } timestamp - The current timestamp from the requestAnimationFrame callback.
        */
      const handler = (timestamp) => {
        if (oldTimestamp === 0) {
          oldTimestamp = timestamp;
        }

        const dt = timestamp - oldTimestamp;
        elapsed += dt;

        if (elapsed >= duration) {
          callback(1, dt / 1000);
          resolve();
          return;
        }


        oldTimestamp = timestamp;
        callback(Math.min(elapsed / duration, 1), dt / 1000);
        requestAnimationFrame(handler);
      }

      requestAnimationFrame(handler);

      resolve = resolve;
    });
  }

  easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  easeInOutQuad(x) {
    if (x < 0.5) {
      return 2 * x * x;
    } else {
      return -1 + (4 - 2 * x) * x;
    }
  }

  easeInOutQuart(x) {
    if (x < 0.5) {
      return 8 * x * x * x * x;
    } else {
      return 1 - Math.pow(-2 * x + 2, 4) / 2;
    }
  }
}
