import { GNode } from './gnode.js';

export class StateMachine extends GNode {
  static Events = {
    ...GNode.Events,
    STATE_CHANGED: 'stateChanged',
    STATE_ENDED: 'stateEnded',
  }

  state = null;

  constructor(initialState = null) {
    super();
    this.state = initialState;
  }

  enterTree() {
    if (this.state) {
      this.state.scene = this.scene;
      this.state.begin();
    }
  }

  setState(state) {
    const oldState = this.state;

    this.state = state;
    this.state.scene = this.scene;
    this.state.begin(oldState);

    if (this.state) {
      this.state.end();
      this.trigger(StateMachine.Events.STATE_ENDED, this.state);
    }

    this.trigger(StateMachine.Events.STATE_CHANGED, this.state);
  }

  process(dt) {
    if (this.state) {
      this.state.process(dt);
    }
  }
}

export class State {
  scene = null;

  /**
    * @template { State } T
    * @param { T } prevState - The previous state, if any.
    */
  begin(prevState) {}
  process(dt) {}
  end() {}
}
