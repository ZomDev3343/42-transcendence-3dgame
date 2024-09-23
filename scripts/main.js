import * as THREE from 'three';
import { InputManager } from './input.js';
import * as Components from "./components.js";
import {WIN_WIDTH, WIN_HEIGHT} from "./constants.js"

/**
 *
 * @param {THREE.Scene} scene
 * @param {InputManager} inputManager
 * @param {THREE.Camera} camera
 * @returns {Components.Level} Level created
 */
function makeMainLevel(scene, inputManager, camera) {
	const level = new Components.Level(scene);

	const groundPlatform = new Components.GameObject("Ground");
	groundPlatform.add(new Components.BasicShape(new THREE.BoxGeometry(15, 1, 15), new THREE.MeshPhongMaterial({color: 0xffffff})));
	groundPlatform.getComponent(Components.BasicShape).mesh.receiveShadow = true;

	
	const cube = new Components.GameObject("Cube");
	cube.add(new Components.BasicShape(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({color: 0xffff00})));
	cube.position.y = 2;
	cube.position.x = 1;
	cube.getComponent(Components.BasicShape).mesh.castShadow = true;
	cube.getComponent(Components.BasicShape).mesh.receiveShadow = true;
	console.log(cube.getComponent(Components.BasicShape).mesh.castShadow);
	
	const sunLight = new THREE.DirectionalLight(0xffffff, 1);
	sunLight.position.set(10, 10, 10);
	sunLight.target.position.copy(cube.position);
	sunLight.castShadow = true;
	scene.add(sunLight);
	scene.add(sunLight.target);

	const lightHelper = new THREE.DirectionalLightHelper(sunLight);
	scene.add(lightHelper);
	
	const player = new Components.GameObject("Player");
	player.add(new Components.PlayerController(inputManager, camera));
	player.position.y = 1;

	level.add(groundPlatform);
	level.add(cube);
	level.add(player);

	return level;
}

function main() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(90, WIN_WIDTH / WIN_HEIGHT, 0.1, 1000.0);
	const renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	const input = new InputManager();
	const level = makeMainLevel(scene, input, camera);
	camera.position.y = 1;

	renderer.setSize(WIN_WIDTH, WIN_HEIGHT);
	renderer.setClearColor(0x00dddd);
	document.body.appendChild(renderer.domElement);

	camera.position.z = 5;

	level.create();
	function animationLoop() {
		level.update();
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

