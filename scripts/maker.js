import { Vector3 } from "three";
import { GameObject, ZombieAI, AnimatedModel } from "./components";
import { ModelManager } from "./utils";

/**
 * @param {Vector3} pos 
 * @returns {GameObject} Zombie game object
 */
export function makeZombie(pos) {
	let zomb = new GameObject("Zombie");
	zomb.position.copy(pos);
	zomb.add(new ZombieAI());
	zomb.add(new AnimatedModel(ModelManager.INSTANCE.getModel("test")))
	return zomb;
};