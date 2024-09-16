class InputManager
{
	constructor()
	{
		this.keymap = {};
		this._pressed = {};
		this._justPressed = {};
		this._listeners = {"keydown": [], "keyup": []};
		this._init();
	}
	_init()
	{
		this._add("w", "up");
		this._add("s", "down");
		this._add("a", "left");
		this._add("d", "right");
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
	_add(keycode, keyname)
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
	_clearListeners()
	{
		for (kd in this._listeners["keydown"])
			window.removeEventListener("keydown", kd);
		for (kd in this._listeners["keyup"])
			window.removeEventListener("keyup", kd);
	}

};

export {InputManager}