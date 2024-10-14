import * as THREE from 'three';
import { InputManager } from './input.js';
import { Level, GameObject, BasicShape, PlayerController, SpawnerManager, ZombieSpawner, PlayerGun } from "./components.js";
import { WIN_WIDTH, WIN_HEIGHT } from "./constants.js"
import { ModelManager, TextureManager,  } from './utils.js';

/**
 *
 * @param {THREE.Scene} scene
 * @param {InputManager} inputManager
 * @param {THREE.Camera} camera
 * @returns {Level} Level created
 */
function makeMainLevel(scene, inputManager, camera) {
	const level = new Level(scene);

	const groundPlatform = new GameObject("Ground");
	groundPlatform.add(new BasicShape(new THREE.BoxGeometry(60, 1, 60), new THREE.MeshBasicMaterial({ color: 0x654005 })));


	const cube = new GameObject("Cube");
	cube.add(new BasicShape(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xffff00 })));
	cube.position.y = 2;
	cube.position.x = 1;

	const player = new GameObject("Player");
	player.add(new PlayerController(inputManager, camera));
	player.add(new PlayerGun(inputManager));
	player.position.y = 1;

	const spawner = new GameObject("SpawnerManager");
	spawner.position.y = 1;
	spawner.add(new SpawnerManager());
	spawner.add(new BasicShape(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xffffff })));
	spawner.getComponent(SpawnerManager).addSpawner(new ZombieSpawner(spawner.position.add({ x: 5, y: 0, z: 5 })));

	level.add(groundPlatform);
	level.add(cube);
	level.add(player);
	level.add(spawner);

	return level;
}


async function main() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(90, WIN_WIDTH / WIN_HEIGHT, 0.1, 1000.0);
	const renderer = new THREE.WebGLRenderer({antialias: true});

	/* Textures initialization */

	TextureManager.INSTANCE.pushTextureInfo("ground", "../textures/ground.jpg");

	await TextureManager.INSTANCE.loadTextures();
	
	/* ----------------------- */
	
	/* Models initialization */

	ModelManager.INSTANCE.pushModelInfo("test", "../models/test.glb");
	ModelManager.INSTANCE.pushModelInfo("gun", "../models/gun.glb");

	await ModelManager.INSTANCE.loadModels();

	/* --------------------- */

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	const input = new InputManager();
	const level = makeMainLevel(scene, input, camera);
	camera.position.y = 1;

	renderer.setSize(WIN_WIDTH, WIN_HEIGHT);
	renderer.setClearColor(0x00dddd);
	document.body.appendChild(renderer.domElement);

	camera.position.z = 5;

	function animationLoop() {
		level.create();
		level.update();
		camera.updateProjectionMatrix();
		renderer.render(scene, camera);
		if (input.justPressed("use")) {
			level.find("SpawnerManager").getComponent(SpawnerManager).startRound();
		}
	}
	renderer.setAnimationLoop(animationLoop);
}

main();

