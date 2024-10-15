import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';


export class SceneMeshes {
    constructor() {}

    createObstacle() {
        const geometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.set(0, 0, -1.5);
        return obstacle;
    }

    createCube() {
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const cube = new THREE.Mesh(geometry, material);
        cube.visible = false;
        return cube;
    }
 
    async loadAndConfigureModel (url, position = { x: 0.5, y: -0.7, z: -2.3 }, scale = { x: 0.005, y: 0.005, z: 0.005 }, rotation = { x: 0, y: 0, z: 0 }) {
        try {
            const objLoader = new OBJLoader();
    
            // Load the model and wait for the Promise to resolve
            const model = await new Promise((resolve, reject) => {
                objLoader.load(
                    url,
                    (object) => {
                        resolve(object); 
                    },
                    undefined,
                    (error) => {
                        reject(error); 
                    }
                );
            });
    
            model.position.set(position.x, position.y, position.z);
            model.scale.set(scale.x, scale.y, scale.z);
            model.rotation.set(rotation.x, rotation.y, rotation.z);
            model.visible = true; 
    
            return model; 

        } catch (error) {
            console.error('Error loading the model:', error);
            throw error;
        }
    }
}