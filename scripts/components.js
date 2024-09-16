import * as THREE from 'three';
import {Level} from './level.js'

class Component{
	constructor(parent){
		this._parent = parent;
		this._position = new THREE.Vector3(0, 0, 0);
		this._rotation = new THREE.Vector3(0, 0, 0);
		this._scale = new THREE.Vector3(1, 1, 1);
	}
	get position(){	return this._position;	}
	set position(pPos){	this._position = pPos;	}

	get rotation(){	return this._rotation;	}
	set rotation(pRot){	this._rotation = pRot;	}

	get scale(){ return this._scale; }
	set scale(pScale){ this._scale = pScale; }

	/**
	 * 
	 * @param {number} deltaTime Time elapsed since last frame 
	 */
	update(deltaTime){}
};

class BasicShape extends Component{
	/**
	 * @param {Component} parent Parent of the component
	 * @param {THREE.BufferGeometry} pShape Geometry of the mesh
	 * @param {THREE.MeshBasicMaterial} mat Material of the mesh
	 */
	constructor(parent, pShape, pMat){
		super(parent);
		this.geometry = pShape;
		this.mat = pMat;
	}
};

class GameObject extends Component{
	/**
	 * @param {Level} level 
	 * @param {string} pName 
	 */
	constructor(level, pName){
		super(level);
		this.name = pName;
		/**
		 * @type {Array<Component>}
		 */
		this.components = [];
	}
	update(deltaTime){
		for (comp in this.components)
			comp.update(deltaTime);
	}

};

class Level extends Component{
	constructor(){
		super(this);
		this.prevTime = Date.now() / 1000.0;
		this._objects = [];
	}
	update(){
		let deltaTime = (Date.now() / 1000.0) - this.prevTime;

		for (obj in this._objects)
			obj.update(deltaTime);
	}
};