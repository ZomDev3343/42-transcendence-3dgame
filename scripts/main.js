import * as THREE from 'three';
import { InputManager } from './input.js';
import * as Components from "./components.js";

const WIN_WIDTH = 1280;
const WIN_HEIGHT = 720;

/**
 *
 * @param {THREE.Scene} scene
 * @param {InputManager} inputManager
 * @returns {Components.Level} Level created
 */
function makeMainLevel(scene, inputManager, camera) {
	const level = new Components.Level(scene);

	const basePlatform = new Components.GameObject("BasePlatform");
	basePlatform.add(new Components.BasicShape(new THREE.BoxGeometry(15, 1, 15), new THREE.MeshBasicMaterial({color: 0xffffff})));

	const cube = new Components.GameObject("Cube");
	cube.add(new Components.BasicShape(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0})));
	cube.position.y = 1;
	cube.position.x = 1;

	const player = new Components.GameObject("Player");
	player.add(new Components.PlayerController(inputManager, camera));
	player.position.y = 1;

	level.add(basePlatform);
	level.add(cube);
	level.add(player);
	return level;
}

function main() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(90, WIN_WIDTH / WIN_HEIGHT, 0.1, 1000.0);
	const renderer = new THREE.WebGLRenderer();
	const input = new InputManager();
	const level = makeMainLevel(scene, input, camera);
	camera.position.y = 1;

	renderer.setSize(WIN_WIDTH, WIN_HEIGHT);
	renderer.setClearColor(0x00dddd);
	document.body.appendChild(renderer.domElement);

	camera.position.z = 5;

	level.create();
	function animationLoop() {
		if (input.justPressed("up")) {

		}
		level.update();
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

