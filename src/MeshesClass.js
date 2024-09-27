import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';


export class SceneMeshes {
    constructor() {}

    createObstacle(obstaclePosition) {
        const geometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.position.copy(obstaclePosition);
        return obstacle;
    }

    createCube() {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const cube = new THREE.Mesh(geometry, material);
        cube.visible = false;
        return cube;
    }

    //SculptureMesh    
    loadSculptureModel(url) {
        return new Promise((resolve, reject) => {
            const objLoader = new OBJLoader();
            objLoader.load(
                url,
                (object) => {
                    const SculptureMesh = object;
                    SculptureMesh.position.set(0, 0, -3);
                    SculptureMesh.scale.set(0.005, 0.005, 0.005);
                    SculptureMesh.rotation.set(0, -Math.PI / 4, 0); // Use radians for rotation
                    SculptureMesh.visible = false;
                    resolve(SculptureMesh); // Resolve the promise with the loaded mesh
                },
                undefined,
                (error) => {
                    reject(error); // Reject the promise if there's an error
                }
            );
        });
    }

}