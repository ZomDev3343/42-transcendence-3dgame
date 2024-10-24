import * as THREE from 'three';
import { InputManager } from './input.js';
import { Level, GameObject, BasicShape, PlayerController, SpawnerManager, ZombieSpawner, PlayerGun, AnimatedModel, MysteryBoxComp } from "./components.js";
import { WIN_WIDTH, WIN_HEIGHT } from "./constants.js"
import { AudioManager, ModelManager, TextureManager,  } from './utils.js';
import { LOG_DEBUG } from './game_logger.js';
import {Sky} from 'three/addons/objects/Sky.js';

/**
 *
 * @param {THREE.Scene} scene
 * @param {InputManager} inputManager
 * @param {THREE.Camera} camera
 * @returns {Level} Level created
 */
function makeMainLevel(scene, inputManager, camera) {
	const level = new Level(scene);

	const sky = new Sky();
	sky.scale.setScalar( 450000 );

	const phi = THREE.MathUtils.degToRad( 180 );
	const theta = THREE.MathUtils.degToRad( 180 );
	const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );

	sky.material.uniforms.sunPosition.value = sunPosition;
	const groundPlatform = new GameObject("Ground");
	groundPlatform.add(new BasicShape(new THREE.BoxGeometry(180, 1, 180), new THREE.MeshPhongMaterial({ color: 0x654005 })));

	const dayLight = new THREE.DirectionalLight(0x7a49a5, 0.6);
	dayLight.position.y = 5;
	dayLight.position.x = 5;
	dayLight.lookAt(groundPlatform.position);

	const mysteryBox = new GameObject("MysteryBox");
	mysteryBox.add(new MysteryBoxComp());
	mysteryBox.position.y = 0.65;
	mysteryBox.scale.copy(new THREE.Vector3(0.25, 0.25, 0.25));
	mysteryBox.position.copy(new THREE.Vector3(3, 0.75, 10));

	const boxLight = new THREE.PointLight(0xff0000, 0.7, 8);
	boxLight.position.copy(mysteryBox.position);
	boxLight.position.y += 1.5;

	const player = new GameObject("Player");
	player.add(new PlayerController(inputManager, camera));
	player.add(new PlayerGun(inputManager));
	player.position.y = 1;

	const spawner = new GameObject("SpawnerManager");
	spawner.position.y = 1;
	spawner.add(new SpawnerManager());
	spawner.getComponent(SpawnerManager).addSpawner(new ZombieSpawner(spawner.position.add({ x: 5, y: 0, z: 5 })));
	spawner.getComponent(SpawnerManager).addSpawner(new ZombieSpawner(spawner.position.add({ x: 25, y: 0, z: 15 })));
	spawner.getComponent(SpawnerManager).addSpawner(new ZombieSpawner(spawner.position.add({ x: -5, y: 0, z: 25 })));

	level.add(groundPlatform);
	level.add(player);
	level.add(spawner);
	level.add(mysteryBox);
	level.scene.add(dayLight);
	level.scene.add(boxLight);
	level.scene.add(sky);

	for (let x = -50; x < 50; x += 3) {
		for (let z = -50; z < 50; z += 2) {
			let r = Math.random() * 100;
			if (r <= 10) {
				let treeCopy = ModelManager.INSTANCE.getModel("tree").scene.clone();
				treeCopy.position.copy(new THREE.Vector3(x, 0.5, z));
				level.scene.add(treeCopy);
				level._mapObjs.push(treeCopy);
			} else if (r > 25 && r <= 50) {
				let rockCopy = ModelManager.INSTANCE.getModel("rock").scene.clone();
				rockCopy.position.copy(new THREE.Vector3(x - 2, 0.5 - Math.random() * 0.25, z - 2));
				rockCopy.scale.multiplyScalar(0.5);
				rockCopy.rotation.setFromVector3(new THREE.Vector3(Math.random() * Math.PI /2, Math.random() * Math.PI, Math.random() * Math.PI / 4));
				level.scene.add(rockCopy);
				level._mapObjs.push(rockCopy);
			}
		}
	}

	return level;
}


async function main() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(90, WIN_WIDTH / WIN_HEIGHT, 0.1, 1000.0);
	const renderer = new THREE.WebGLRenderer({antialias: true});

	/* Textures initialization */

	TextureManager.INSTANCE.pushTextureInfo("hitmarker", "../textures/hitmarker.png");
	TextureManager.INSTANCE.pushTextureInfo("target", "../textures/target.png");

	await TextureManager.INSTANCE.loadTextures();

	/* ----------------------- */

	/* Models initialization */

	ModelManager.INSTANCE.pushModelInfo("zombie", "../models/zombie.glb");
	ModelManager.INSTANCE.pushModelInfo("gun", "../models/gun.glb");
	ModelManager.INSTANCE.pushModelInfo("rifle", "../models/rifle.glb");
	ModelManager.INSTANCE.pushModelInfo("laser", "../models/raygun.glb");
	ModelManager.INSTANCE.pushModelInfo("danceBomb", "../models/dancebomb.glb");
	ModelManager.INSTANCE.pushModelInfo("box", "../models/box.glb");
	ModelManager.INSTANCE.pushModelInfo("rock", "../models/rock.glb");
	ModelManager.INSTANCE.pushModelInfo("tree", "../models/tree.glb");

	await ModelManager.INSTANCE.loadModels();

	/* --------------------- */

	/* Sounds Initialization */

	AudioManager.INSTANCE.pushSoundInfo("gunFire", "../sounds/gunFire.ogg");
	AudioManager.INSTANCE.pushSoundInfo("raygun", "../sounds/raygun.ogg");
	AudioManager.INSTANCE.pushSoundInfo("hit", "../sounds/hit.ogg");
	AudioManager.INSTANCE.pushSoundInfo("gunReload", "../sounds/gunReload.ogg");
	AudioManager.INSTANCE.pushSoundInfo("playerHit", "../sounds/playerHit.ogg");
	AudioManager.INSTANCE.pushSoundInfo("dancebomb", "../sounds/dancebomb.ogg");
	AudioManager.INSTANCE.pushSoundInfo("theme", "../sounds/theme.ogg");


	await AudioManager.INSTANCE.loadSounds();

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
	camera.updateProjectionMatrix();

	function animationLoop() {
		level.create();
		level.update();
		renderer.render(scene, camera);
	}
	let scoreText = document.createElement("h1");
	scoreText["id"] = "score_text";
	scoreText.textContent = "0";
	document.body.appendChild(scoreText);
	let roundText = document.createElement("h1");
	roundText["id"] = "round_text";
	roundText.textContent = "Test";
	document.body.appendChild(roundText);
	let infoText = document.createElement("h1");
	infoText["id"] = "info_text";
	document.body.appendChild(infoText);
	renderer.setAnimationLoop(animationLoop);
	AudioManager.INSTANCE.playSound("theme", level.find("Player").getComponent(PlayerController)._audioListener, true, 0.05);
	level.find("SpawnerManager").getComponent(SpawnerManager).startRound();

}

main();

