import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LOG_DEBUG, LOG_ERROR, LOG_INFO, LOG_WARNING } from "./game_logger";

export async function sleep(ms) {
	return new Promise(r => setTimeout(r, ms));
}

export class ModelManager {
	constructor(loader) {
		this._loader = loader;
		this._modelsToLoad = [];
		this._models = {};
	}

	static INSTANCE = new ModelManager(new GLTFLoader());

	get models() { return this._models; }
	set models(_) { }

	get loader() { return this._loader; }

	pushModelInfo(modelName, modelPath) {
		this._modelsToLoad.push({ name: modelName, path: modelPath });
	}

	addModel(modelName, modelGLTF) {
		this.models[modelName] = modelGLTF;
	}

	async loadModels() {
		let modelsLoaded = 0;
		let loadingError = false;
		let errorMsg = "";
		let modelsAmount = this._modelsToLoad.length;
		if (modelsAmount > 0) {
			for (let modelInfo of this._modelsToLoad) {
				this.loader.load(modelInfo.path,
					model => { this.addModel(modelInfo.name, model), modelsLoaded++; },
					xhr => LOG_DEBUG(modelInfo.name + " model is loading : " + xhr.loaded / xhr.total * 100 + " / 100%"),
					err => { loadingError = true; errorMsg = err; }
				);
			}
		}
		await new Promise(res => {
			const interID = setInterval(() => {
				if (modelsLoaded === modelsAmount || loadingError === true) {
					clearInterval(interID);
					res();
				}
			}, 50);
		});
		this._modelsToLoad.length = 0;
		if (loadingError === true)
			LOG_WARNING("Error while loading some models! " + errorMsg);
		else
			LOG_INFO("All the models loaded successfully!");
	}

	getModel(name) {
		if (name in this.models) {
			return {scene: this.models[name].scene.clone(), animations: this.models[name].animations};
		}
		return undefined;
	}

	get loader() { return this._loader; }
};