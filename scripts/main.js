import * as THREE from 'three';
import { makeCube } from './cube.js'
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
	renderer.setClearColor(0x00dddd);
	document.body.appendChild(renderer.domElement);
	
	const cubes = [];
	const amt = 100;
	for (let i = 0; i < amt; i++)
		cubes[i] = makeCube(Math.random() * 0xffffff, 1);
	for (let i = 0; i < amt; i++)
	{
		cubes[i].position.x = -5 + Math.random() * 10;
		cubes[i].position.y = -4 + Math.random() * 8;
		cubes[i].rotation.x = Math.random() * Math.PI;
		cubes[i].rotation.y = Math.random() * Math.PI;
		scene.add(cubes[i]);
	}
	camera.position.z = 5;
	
	function animationLoop()
	{
		for (let i = 0; i < amt; i++){
			cubes[i].rotation.x += 0.01;
			cubes[i].rotation.y += 0.01;
		}
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

