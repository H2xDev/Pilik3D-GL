import { GNode } from "./gnode.js";

class InputAction {
  key = null;
  pressed = false;

  get isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  constructor(key = null, actionName = "action") {
    this.key = key;
    this.actionName = actionName;

    this.defineSensorButton();
  }

  defineSensorButton() {
    if (!this.isMobile) return;

    const button = Object.assign(document.createElement("button"), {
      className: `input-button i-${this.actionName}`,
      innerText: this.actionName ? this.actionName : "Sensor",
    });

    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
      this.pressed = true;
      button.classList.add("pressed");
      const inputEvent = new KeyboardEvent("keydown", { code: this.key });
      document.dispatchEvent(inputEvent);
    });

    button.addEventListener("touchend", (event) => {
      event.preventDefault();
      this.pressed = false;
      button.classList.remove("pressed");
      const inputEvent = new KeyboardEvent("keyup", { code: this.key });
      document.dispatchEvent(inputEvent);
    });

    document.querySelector('.input-controls').appendChild(button);
  }
}

export class Input extends GNode {
  /** @type { Record<string, InputAction> } */
  actions = {};

  static Events = {
    ...GNode.Events,
    ACTION_PRESSED: "actionPressed",
    ACTION_RELEASED: "actionReleased",
    ANY_PRESSED: "anyPressed",
  }

  /**
    * Creates an Input instance that listens for keydown and keyup events.
    * @param { Record<string, string> } actions - An object mapping action names to InputAction instances.
    */
  constructor(actions = {}) {
    super();
    document.addEventListener("keydown", (event) => this.#processActions(event.code, true));
    document.addEventListener("keyup", (event) => this.#processActions(event.code, false));


    for (const actionName in actions) {
      this.registerAction(actionName, actions[actionName]);
    }
  }

  /** 
    * @param { string } keyCode 
    * @param { boolean } pressed - Indicates whether the key is pressed (true) or released (false).
    */
  #processActions(keyCode, pressed) {
    if (pressed) {
      this.trigger(Input.Events.ANY_PRESSED, keyCode);
    }

    for (const actionName in this.actions) {
      const action = this.actions[actionName];
      if (!action.key || action.key !== keyCode) continue;
      action.pressed = pressed;

      this.trigger(pressed ? Input.Events.ACTION_PRESSED : Input.Events.ACTION_RELEASED, actionName);
    }
  }

  /**
    * @param { string } name - The name of the action to register.
    * @param { string } key - The key code associated with the action (e.g., "KeyW", "KeyA").
    */
  registerAction(name, key) {
    if (!this.actions[name]) {
      this.actions[name] = new InputAction(key, name);
    }

    this.actions[name].key = key;
  }

  /**
    * @param { string } name - The name of the action to check.
    */
  isActionPressed(name) {
    const action = this.actions[name];
    return action ? action.pressed : false;
  }

  /**
    * @param { string } xpos - The action name for positive X direction (e.g., "KeyD").
    * @param { string } xneg - The action name for negative X direction (e.g., "KeyA").
    * @param { string } ypos - The action name for positive Y direction (e.g., "KeyW").
    * @param { string } yneg - The action name for negative Y direction (e.g., "KeyS").
    */
  getAxis(xpos, xneg, ypos, yneg) {
    let x = 0;
    let y = 0;

    if (this.isActionPressed(xpos)) x += 1;
    if (this.isActionPressed(xneg)) x -= 1;
    if (this.isActionPressed(ypos)) y += 1;
    if (this.isActionPressed(yneg)) y -= 1;

    return { x, y };
  }
}
