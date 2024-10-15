import * as THREE from 'three';
import { RoomSpatialAudio } from './SpatialAudio.js';

// Global Object Declaration
let session = null;
let referenceSpace = null;
let audioContext;
let roomSpatialAudio;   




document.getElementById('arButton').addEventListener('click', onARButtonClick);

async function onARButtonClick() {
    const arButton = document.getElementById('arButton');

    if (arButton.textContent === "Start AR") {
        console.log("Start AR button clicked.");
        await startXR();
        arButton.textContent = "Stop AR"; // Switch to Stop
    } else {
        console.log("Stop AR button clicked.");
        if (session) {

            roomSpatialAudio.closeAllAudio();
            await session.end();
            arButton.textContent = "Start AR"; // Switch back to Start
        }
    }
}

async function startXR() {
    try {
        if (!navigator.xr) {
            console.error("WebXR not supported");
            return;
        }

        session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['dom-overlay'],
            domOverlay: { root: document.body }
        });

        referenceSpace = await session.requestReferenceSpace('local');
        console.log("Immersive AR session started.");

        // Spatial Audio

    


        const { renderer, scene, camera } = setupThreeJS();

        renderer.xr.setAnimationLoop(() => {

            const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

            roomSpatialAudio.updateListenerPosition(userPosition.x, userPosition.y, userPosition.z,camera);
            renderer.render(scene, camera);
        });
    } catch (error) {
        console.error("An error occurred while starting the XR session:", error);
    }
}

function setupThreeJS() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    scene.add(camera);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 1, 0);
    scene.add(light);

    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const gl = canvas.getContext('webgl2', { xrCompatible: true });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas, context: gl });
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    renderer.xr.setSession(session);

    // Create a cube
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3); // Cube size
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000}); // Red wireframe
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0.5, 0, -2); // Set the cube in front of the camera
    scene.add(cube);


    // Create a cube
    const geometry1 = new THREE.BoxGeometry(0.3, 0.3, 0.3); // Cube size
    const material1 = new THREE.MeshBasicMaterial({ color: 0x0000ff}); // Red wireframe
    const cube1 = new THREE.Mesh(geometry1, material1);
    cube1.position.set(0, 0, -1); // Set the cube in front of the camera
    scene.add(cube1);


    audioContext = new AudioContext();

    roomSpatialAudio = new RoomSpatialAudio(audioContext);      

    roomSpatialAudio.addPositionBasedAudio('audio1', 'Audio/A.mp3', { x: cube.position.x , y: cube.position.y, z: cube.position.z });

    roomSpatialAudio.addPositionBasedAudio('audio2', 'Audio/A2.mp3', { x: cube1.position.x , y: cube1.position.y, z: cube1.position.z });

    roomSpatialAudio.togglePositionBasedAudio('audio1', true);
    roomSpatialAudio.togglePositionBasedAudio('audio2', true);


    // Adding background spatial audio with a unique ID
    roomSpatialAudio.addBackgroundAudio('background', 'Audio/Mining.mp3');
    roomSpatialAudio.toggleBackgroundAudio(true);
     




    return { renderer, scene, camera };
}
