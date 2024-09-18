import * as THREE from 'three';
import { makeCube } from './cube.js'
import { InputManager } from './input.js';
import * as Components from "./components.js";

const WIN_WIDTH = 1280;
const WIN_HEIGHT = 720;

function main()
{
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(90, WIN_WIDTH / WIN_HEIGHT, 0.1, 1000.0);
	const renderer = new THREE.WebGLRenderer();
	const input = new InputManager();
	const level = new Components.Level(scene);
	renderer.setSize(WIN_WIDTH, WIN_HEIGHT);
	renderer.setClearColor(0x00dddd);
	document.body.appendChild(renderer.domElement);

	camera.position.z = 5;
	let go = new Components.GameObject("Yolo");
	// TODO Adding parent automatically when adding a component to a gameobject
	// Testing rendering of a level
	level.add(new Components.GameObject("Yolo"));

	function animationLoop()
	{
		level.update();
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

