import * as THREE from 'three'
import { LOG_DEBUG, LOG_ERROR, LOG_WARNING } from './game_logger.js';
import { generateUUID } from 'three/src/math/MathUtils.js';
import { makeZombie } from './maker.js';
import { sleep } from './utils.js';

export class Component {
	constructor(parent, scene) {
		this._parent = parent;
		this._position = new THREE.Vector3(0, 0, 0);
		this._rotation = new THREE.Vector3(0, 0, 0);
		this._scale = new THREE.Vector3(1, 1, 1);
		this._uuid = generateUUID();
		this.scene = scene;
	}

	get uuid() { return this._uuid; }

	get parent() { return this._parent; }
	set parent(pParent) {
		this._parent = pParent;
		this._scene = pParent._scene;
	}

	get position() { return this._position; }
	set position(pPos) { this._position = pPos; }

	get rotation() { return this._rotation; }
	set rotation(pRot) { this._rotation = pRot; }

	get scale() { return this._scale; }
	set scale(pScale) { this._scale = pScale; }

	get scene() { return this._scene; }
	set scene(pScene) { this._scene = pScene; }

	create() { }
	remove() { }
	/**
	 * @returns {Level | null}
	 */
	getLevel() {
		let tmp = this.parent;
		if (!tmp)
			return null;
		while (tmp != null && !(tmp instanceof Level))
			tmp = tmp.parent;
		return tmp;
	}
	/**
	 *
	 * @param {number} _ Time elapsed since last frame
	 */
	update(_) { }
	clone() { return this; }
};

export class BasicShape extends Component {
	/**
	 * @param {Component} parent Parent of the component
	 * @param {THREE.BufferGeometry} pShape Geometry of the mesh
	 * @param {THREE.MeshBasicMaterial} mat Material of the mesh
	 */
	constructor(pShape, pMat) {
		super(null, null);
		this.geometry = pShape;
		this.mat = pMat;
		this.mesh = new THREE.Mesh(this.geometry, this.mat);
	}
	create() {
		this.parent.scene.add(this.mesh);
	}
	remove() {
		this.parent.scene.remove(this.mesh);
	}
	update(_) {
		if (!this.parent)
			return;
		let newPos = this.position.clone();
		let newRot = this.rotation.clone();

		newPos.add(this.parent.position);
		newRot.add(this.parent.rotation);

		this.mesh.position.copy(newPos);
		this.mesh.rotation.setFromVector3(newRot);
	}
	clone() {
		return new BasicShape(this.geometry, this.mat);
	}
};

export class GameObject extends Component {
	/**
	 * @param {Level} level
	 * @param {string} pName
	 */
	constructor(pName) {
		super(null, null);
		this._name = pName;
		/**
		 * @type {Array<Component>}
		 */
		this.components = [];
	}
	get name() { return this._name; }
	set name(pName) { this._name = pName; }
	add(component) {
		if (component instanceof Component) {
			if (this.components.includes(component))
				return;
			component.parent = this;
			console.log(component);
			this.components.push(component);
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
			}
		}
		else
			LOG_ERROR("Can't add non-component to %s gameobject!", this.name);
	}
	/**
	 * 
	 * @param {Component} type 
	 * @returns 
	 */
	getComponent(type) {
		for (let comp of this.components) {
			if (comp instanceof type)
				return comp;
		}
		return undefined;
	}
	create() {
		if (this.parent === undefined) {
			LOG_ERROR("%s gameobject is not affected to a level!", this.name);
			return;
		}
		for (let comp of this.components) {
			if (comp instanceof Component)
				comp.create();
		}
	}
	remove() {
		if (this.parent === null) {
			LOG_ERROR("%s gameobject is not affected to a level!", this.name);
			return;
		}
		for (let comp of this.components)
			if (comp instanceof Component)
				comp.remove();
	}
	objUpdate(dt) { }
	update(dt) {
		if (this.parent === null)
			return;
		this.objUpdate(dt);
		for (let comp of this.components)
			comp.update(dt);
	}
	clone() {
		let cloneObj = new GameObject(this.name);
		cloneObj.position = this.position.clone();
		cloneObj.rotation = this.rotation.clone();
		cloneObj.scale = this.scale.clone();
		for (let comp of this.components)
			cloneObj.add(comp.clone());
		cloneObj.objUpdate = this.objUpdate;
		return cloneObj;
	}
};

export class Level extends Component {
	/**
	 *
	 * @param {THREE.Scene} scene
	 */
	constructor(scene) {
		super(null, scene);
		this.prevTime = Date.now() / 1000.0;
		this._objects = [];
	}
	add(gameobject) {
		if (gameobject instanceof GameObject) {
			if (this._objects.includes(gameobject))
				return;
			gameobject.parent = this;
			gameobject.scene = this.scene;
			this._objects.push(gameobject);
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
	create() {
		for (let obj of this._objects) {
			obj.create();
		}
	}
	clear() {
		for (let obj in this._objects) {
			obj.remove();
		}
		this._objects.length = 0;
	}
	update(_) {
		let deltaTime = (Date.now() / 1000.0) - this.prevTime;

		for (let obj of this._objects) {
			if (obj instanceof GameObject) {
				obj.update(deltaTime);
			}
		}
		this.prevTime = Date.now() / 1000.0;
	}
	findAll(objName) {
		return this._objects.filter((obj) => obj.name.startsWith(objName));
	}
	find(objName) {
		return this.findAll(objName)[0];
	}
};

export class PlayerController extends Component {
	constructor(input_manager, camera) {
		super(null, null);
		this._input = input_manager;
		this._camera = camera;
		this._moveSpeed = 4.0;
		this._score = 0;
	}

	get input() { return this._input; }
	set input(newInputManager) { this._input = newInputManager; }

	/**
	 * @returns {THREE.Camera}
	 */
	get camera() { return this._camera; }
	set camera(newCamera) { this._camera = newCamera; }

	getForward() {
		return new THREE.Vector3(
			Math.sin(this.camera.rotation.y),
			0,
			Math.cos(this.camera.rotation.y)
		);
	}

	getRight() {
		return new THREE.Vector3(
			Math.cos(this.camera.rotation.y),
			0,
			-Math.sin(this.camera.rotation.y)
		);
	}

	update(dt) {
		if (!parent)
			return;
		if (this.input.pressed("look_left")) {
			this.camera.rotation.y += (Math.PI) * dt;
		}
		else if (this.input.pressed("look_right")) {
			this.camera.rotation.y += -(Math.PI) * dt;
		}
		if (this.input.pressed("up")) {
			this.parent.position.x += -this.getForward().x * this._moveSpeed * dt;
			this.parent.position.z += -this.getForward().z * this._moveSpeed * dt;
		}
		else if (this.input.pressed("down")) {
			this.parent.position.x += this.getForward().x * this._moveSpeed * dt;
			this.parent.position.z += this.getForward().z * this._moveSpeed * dt;
		}
		else if (this.input.pressed("right")) {
			this.parent.position.x += this.getRight().x * this._moveSpeed * dt;
			this.parent.position.z += this.getRight().z * this._moveSpeed * dt;
		}
		else if (this.input.pressed("left")) {
			this.parent.position.x += -this.getRight().x * this._moveSpeed * dt;
			this.parent.position.z += -this.getRight().z * this._moveSpeed * dt;
		}
		this.camera.position.copy(this.parent.position);
		this.parent.rotation.copy(this.camera.rotation);
	}
};

export class ZombieAI extends Component {
	constructor() {
		super(null, null);
		this._velX = 0;
		this._velY = 0;
		this._moveSpeed = 1.0;
		this._directionHelper = new THREE.ArrowHelper();
	}
	create(){
		super.create();
		this._directionHelper.position.copy(this.parent.position);
		this.parent.scene.add(this._directionHelper);
	}
	update(dt) {
		if (!parent)
			return;
		this.parent.position.x += this._velX * this._moveSpeed * dt;
		this.parent.position.y += this._velY * this._moveSpeed * dt;
		this._directionHelper.setDirection(new THREE.Vector3(-Math.cos(this.parent.rotation.y), 0, Math.sin(this.parent.rotation.y)).normalize());
	}
};

export class SpawnerManager extends Component {
	constructor() {
		super(null, null);
		this._round = 0;
		this._roundStarted = false;
		this._spawners = [];
	}
	get timeBeforeRound() { if (this._round == 1) return 2; else return 8; }
	addSpawner(spawner) {
		if (spawner instanceof ZombieSpawner) {
			spawner.parent = this;
			this._spawners.push(spawner);
		}
	}
	async startRound() {
		if (this._roundStarted)
			return ;
		this._round++;
		// Show round number
		LOG_DEBUG("Round %d is starting...", this._round)
		await sleep(this.timeBeforeRound * 1000);
		LOG_DEBUG("Round started %d started!", this._round);
		this._roundStarted = true;
		for (let spawner of this._spawners) {
			if (spawner instanceof ZombieSpawner) {
				await sleep(1000 + Math.random() * 1500);
				spawner._leftToSpawn = 3 + (2 * (this._round - 1));
				spawner.spawn();
			}
		}
	}
};

export class AnimatedModel extends Component {
	constructor(gltf){
		super(null, null);
		this._gltf = gltf;
	}

	get gltf() { return this._gltf; }
	set gltf(_) {}
	
	create(){
		this.parent.scene.add(this.gltf.scene);
	}
	remove() {
		this.parent.scene.remove(this.gltf.scene);
	}
	update(_) {
		if (!this.parent)
			return ;
		this.gltf.scene.position.copy(this.parent.position);
		this.gltf.scene.scale.copy(this.parent.scale);
		this.gltf.scene.rotation.setFromVector3(this.parent.rotation);
	}
	playAnimation(animName) {
		
	}
};

export class ZombieSpawner extends Component {

	static spawnerID = 0;

	/**
	 * @param {THREE.Vector3} pos 
	 */
	constructor(pos) {
		super("ZombieSpawner" + ZombieSpawner.spawnerID++);
		this.position.copy(pos);
		this.position.y = 1;
		this._manager = null;
		this._spawnRate = 5;
		this._leftToSpawn = 3;
		this._spawnRange = 8;
	}
	async spawn() {
		if (!parent || this._leftToSpawn <= 0)
			return;
		let level = this.getLevel();
		if (level) {
			let spawnPos = this.position.clone();
			
			spawnPos.x += Math.random() * 2;
			spawnPos.y = 1.5;
			let zomb = makeZombie(spawnPos);
			this.getLevel().add(zomb);
			this._leftToSpawn--;
			
			await sleep(this._spawnRate * 1000);
			this.spawn();
		}
	}
};