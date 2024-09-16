class InputManager
{
	constructor()
	{
		this.keymap = {};
		this._pressed = {};
		this._justPressed = {};
		this._listeners = {"keydown": [], "keyup": []};
		this.#init();
	}
	#init()
	{
		this.#add("w", "up");
		this.#add("s", "down");
		this.#add("a", "left");
		this.#add("d", "right");
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
	#add(keycode, keyname)
	{
		if (!(this.keymap[keycode] instanceof Array))
				this.keymap[keycode] = [];
		this.keymap[keycode].push(keyname);
		this._pressed[keyname] = false;

		let downCallback = ev => {
			if (ev.key == keycode && !ev.repeat){
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
		for (kd in this._listeners["keydown"])
			window.removeEventListener("keydown", kd);
		for (kd in this._listeners["keyup"])
			window.removeEventListener("keyup", kd);
	}

};

export {InputManager}