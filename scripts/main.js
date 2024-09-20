import * as THREE from 'three';
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
	go.add(new Components.BasicShape(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0})));
	go.objUpdate = function(dt) {
		this.rotation.x += (Math.PI / 20) * dt;
		this.rotation.y += (Math.PI / 20) * dt;
	};

	level.add(go);
	level.create();

	function animationLoop()
	{
		if (input.justPressed("up"))
			level.remove(go);
		level.update();
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

