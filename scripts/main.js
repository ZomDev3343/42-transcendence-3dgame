import * as THREE from 'three';
import {makeCube} from './cube.js'
import { InputManager } from './input.js';

const WIN_WIDTH = 1280;
const WIN_HEIGHT = 720;

function main()
{
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(90, WIN_WIDTH / WIN_HEIGHT, 0.1, 1000.0);
	const renderer = new THREE.WebGLRenderer();
	const input = new InputManager();
	renderer.setSize(WIN_WIDTH, WIN_HEIGHT);
	document.body.appendChild(renderer.domElement);
	
	let cube = makeCube(0xf3f0f, 1);
	scene.add(cube);
	camera.position.z = 5;
	
	function animationLoop()
	{
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;

		if (input.keyJustPressed("up"))
			console.log("jfgewiogioewhgw");
	
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

