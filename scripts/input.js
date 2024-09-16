class InputManager
{
	constructor()
	{
		this.keymap = {};
		this.pressed = {};
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
	keyPressed(keyname)
	{
		return this.pressed[keyname] == true;
	}
	_add(keycode, keyname)
	{
		if (!(this.keymap[keycode] instanceof Array))
				this.keymap[keycode] = [];
		this.keymap[keycode].push(keyname);
		this.pressed[keyname] = false;

		let downCallback = ev => {
			if (ev.key == keycode)
				this.pressed[keyname] = true;
		};

		let upCallback = ev => {
			if (ev.key == keycode)
				this.pressed[keyname] = false;
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