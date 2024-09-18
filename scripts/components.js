import * as THREE from 'three';
import { Level } from './level.js'
import { LOG_ERROR, LOG_WARNING } from './game_logger.js';

class Component {
	constructor(parent, scene) {
		this._parent = parent;
		this._position = new THREE.Vector3(0, 0, 0);
		this._rotation = new THREE.Vector3(0, 0, 0);
		this._scale = new THREE.Vector3(1, 1, 1);
		if (!(parent != this))
			this._scene = scene;
	}

	get parent() { return this._parent; }
	set parent(pParent) { this._parent = pParent; }

	get position() { return this._position; }
	set position(pPos) { this._position = pPos; }

	get rotation() { return this._rotation; }
	set rotation(pRot) { this._rotation = pRot; }

	get scale() { return this._scale; }
	set scale(pScale) { this._scale = pScale; }

	get scene() { return this._scene; }
	set scene(pScene) { }

	create() { }
	remove() { }
	/**
	 *
	 * @param {number} _ Time elapsed since last frame
	 */
	update(_) { }
};

class BasicShape extends Component {
	/**
	 * @param {Component} parent Parent of the component
	 * @param {THREE.BufferGeometry} pShape Geometry of the mesh
	 * @param {THREE.MeshBasicMaterial} mat Material of the mesh
	 */
	constructor(parent, pShape, pMat) {
		super(parent, parent.scene);
		this.geometry = pShape;
		this.mat = pMat;
		this.mesh = new THREE.Mesh(this.geometry, this.mat);
	}
	create() {
		this.scene.add(this.mesh);
	}
	remove() {
		this.scene.remove(this.mesh);
	}
	update(_) {
		this.mesh.position = this.parent.position + this.position;
		this.mesh.rotation = this.parent.rotation + this.rotation;
		this.mesh.scale = this.parent.scale + this.scale;
	}
};

class GameObject extends Component {
	/**
	 * @param {Level} level
	 * @param {string} pName
	 */
	constructor(pName) {
		super(null, null);
		this.name = pName;
		/**
		 * @type {Array<Component>}
		 */
		this.components = [];
	}
	add(component) {
		if (component instanceof Component) {
			if (this.components.includes(component))
				return;
			this.components.push(component);
			component.create();
		}
		else
			LOG_ERROR("Can't add non-component to %s gameobject!", this.name);
	}
	remove(component) {
		if (component instanceof Component) {
			if (!this.components.includes(component))
				return;
			let idx = this.components.indexOf(component);
			if (idx !== -1) {
				this.components.splice(idx, 1);
				component.remove();
			}
		}
		else
			LOG_ERROR("Can't add non-component to %s gameobject!", this.name);
	}
	create() {
		if (this.parent === null) {
			LOG_ERROR("%s gameobject is not affected to a level!", this.name);
			return;
		}
		for (comp in this.components)
			comp.create();
	}
	remove() {
		if (this.parent === null) {
			LOG_ERROR("%s gameobject is not affected to a level!", this.name);
			return;
		}
		for (comp in this.components)
			comp.remove();
	}
	update(dt) {
		if (this.parent === null)
			return;
		for (comp in this.components)
			comp.update(dt);
	}
};

class Level extends Component {
	/**
	 *
	 * @param {THREE.Scene} scene
	 */
	constructor(scene) {
		super(this, scene);
		this.prevTime = Date.now() / 1000.0;
		this._objects = [];
	}
	add(gameobject) {
		if (gameobject instanceof GameObject) {
			if (this._objects.includes(gameobject))
				return;
			this._objects.push(gameobject);
			gameobject.parent = this;
			gameobject.create();
		}
		else
			LOG_WARNING("Attempting to create add a non-Gameobject to the level!");
	}
	remove(gameobject) {
		if (gameobject instanceof GameObject) {
			if (this._objects.includes(gameobject)) {
				let idx = this._objects.indexOf(gameobject);
				if (idx !== -1) {
					gameobject.remove();
					this._objects.splice(idx, 1);
				}
			}
		}
	}
	clear() {
		for (obj in this._objects) {
			obj.remove();
		}
		this._objects.length = 0;
	}
	update(_) {
		let deltaTime = (Date.now() / 1000.0) - this.prevTime;

		for (obj in this._objects)
			obj.update(deltaTime);
		this.prevTime = Date.now() / 1000.0;
	}
};

export { Component, BasicShape, GameObject, Level };
