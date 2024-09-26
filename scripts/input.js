import { WIN_HEIGHT, WIN_WIDTH } from "./constants";

class InputManager
{
	constructor()
	{
		this.keymap = {};
		this._pressed = {};
		this._justPressed = {};
		this._listeners = {"keydown": [], "keyup": []};
		this.mouseX = 0;
		this.mouseY;
		this.#init();
	}
	#init()
	{
		this.#add_key("w", "up");
		this.#add_key("s", "down");
		this.#add_key("a", "left");
		this.#add_key("d", "right");
		this.#add_key("ArrowLeft", "look_left");
		this.#add_key("ArrowRight", "look_right");
		this.#add_key("e", "use");
	}
	pressed(keyname)
	{
		return this._pressed[keyname] == true;
	}
	justPressed(keyname)
	{
		if (!this._justPressed[keyname] && this._pressed[keyname]){
			this._justPressed[keyname] = true;
			return true;
		}
		return false;
	}
	#add_key(keycode, keyname)
	{
		if (!(this.keymap[keycode] instanceof Array))
				this.keymap[keycode] = [];
		this.keymap[keycode].push(keyname);
		this._pressed[keyname] = false;

		let downCallback = ev => {
			if (ev.key == keycode && !ev.repeat){
				ev.preventDefault();
				this._pressed[keyname] = true;
			}
		};

		let upCallback = ev => {
			if (ev.key == keycode && !ev.repeat){
				this._pressed[keyname] = false;
				this._justPressed[keyname] = false;
			}
		};

		this._listeners["keydown"].push(downCallback);
		this._listeners["keyup"].push(upCallback);

		window.addEventListener("keydown", downCallback);
		window.addEventListener("keyup", upCallback);
	}
	clearListeners()
	{
		for (key in this._listeners)
			for (kd of this._listeners[key])
				window.removeEventListener(key, kd);
	}
};

export {InputManager};
