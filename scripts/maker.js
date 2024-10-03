import { Vector3 } from "three";
import { GameObject, ZombieAI, ZombieModel } from "./components";

/**
 * @param {Vector3} pos 
 * @returns {GameObject} Zombie game object
 */
export function makeZombie(pos) {
	let zomb = new GameObject("Zombie");
	zomb.position.copy(pos);
	zomb.add(new ZombieAI());
	zomb.add(new ZombieModel());
	return zomb;
};