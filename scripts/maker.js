import { BoxGeometry, MeshBasicMaterial, MeshPhongMaterial } from "three";
import { Vector3 } from "three";
import { GameObject, BasicShape, ZombieAI } from "./components";

/**
 * @param {Vector3} pos 
 * @returns {GameObject} Zombie game object
 */
export function makeZombie(pos)
{
	let zomb = new GameObject("Zombie");
	zomb.position.copy(pos);
	zomb.add(new BasicShape(new BoxGeometry(0.5, 0.5, 0.5), new MeshBasicMaterial({color: 0xcb13cb})));
	zomb.add(new ZombieAI());
	return zomb;
};