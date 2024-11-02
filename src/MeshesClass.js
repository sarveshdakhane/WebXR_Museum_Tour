import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class SceneMeshes {
    constructor() {}

    createObstacle() {

        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);

        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });

        const obstacle = new THREE.Mesh(geometry, material);
        obstacle.name = 'obsracle';
        obstacle.position.set(0.5, 0, -1.5);
        return obstacle;

    }

    createCube() {
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const originalMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const cube = new THREE.Mesh(geometry, originalMaterial);
        cube.visible = false;
        cube.name = 'BlueCube';

        const DangerzoneMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        cube.userData.originalMaterial = originalMaterial;
        cube.userData.DangerzoneMaterial = DangerzoneMaterial;
        cube.userData.useExtraMaterial = false; 

        cube.onBeforeRender = () => {
            cube.material = cube.userData.useExtraMaterial
                ? cube.userData.DangerzoneMaterial
                : cube.userData.originalMaterial;
        };
    
        return cube;
    }

    createButton(id, position = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 2 - 1 }) {
        const geometry = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 32);
        const textureLoader = new THREE.TextureLoader();
        const topTexture = textureLoader.load('Images/Restart.jpg');
        
        // Create the original materials for the button
        const materialSide = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const materialTop = new THREE.MeshStandardMaterial({ map: topTexture });
        const originalMaterials = [materialSide, materialTop, materialSide];
        
        // Create the button with the original materials
        const button = new THREE.Mesh(geometry, originalMaterials);
        button.visible = false;
        button.name = id;
        button.rotation.x = Math.PI / 2;
        button.position.set(position.x, position.y, position.z);
    
        return button;
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
            model.name = id;
            model.position.set(position.x, position.y, position.z);
            model.scale.set(scale.x, scale.y, scale.z);
            model.rotation.set(rotation.x, rotation.y, rotation.z);
            model.visible = true; 
            model.traverse((child) => {
                if (child.isMesh) {
                    child.name = id;
                }
            });    
            return model; 

        } catch (error) {
            console.error('Error loading the model:', error);
            throw error;
        }
    }

    async loadAndConfigureModelGLTF(url, id, position, scale, rotation) {
        try {
            const gltfLoader = new GLTFLoader();
    
            // Load the model and wait for the Promise to resolve
            const gltf = await new Promise((resolve, reject) => {
                gltfLoader.load(
                    url,
                    (gltf) => resolve(gltf),
                    undefined,
                    (error) => {
                        console.error('Error loading GLTF model:', error);
                        reject(error);
                    }
                );
            });
    
            const model = gltf.scene;
            model.name = id;
            model.position.set(position.x, position.y, position.z);
            model.scale.set(scale.x, scale.y, scale.z);
            model.rotation.set(rotation.x, rotation.y, rotation.z);
            model.visible = false;
    
            // Add an AnimationMixer for the model if it has animations
            let mixer = null;
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    action.play();
                });
            }
    
            model.traverse((child) => {
                if (child.isMesh) {
                    child.name = id;
                }
            });
   
    
            // Return model, mixer, position, and rotation
            return {
                model,
                mixer,
                position: model.position.clone(),
                rotation: model.rotation.clone()
            };
    
        } catch (error) {
            console.error('Error loading the GLTF model:', error);
            throw error;
        }
    }
    
    
    
}