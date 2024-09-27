import * as THREE from 'three';
import { createXRImageBitmap, PlaceObjectOnTarget, FindDistance } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RoomSpatialAudio } from './SpatialAudio.js';
import { SceneMeshes } from './MeshesClass.js';


let session = null;
let referenceSpace = null;
const obstaclePosition = new THREE.Vector3(0, 0, -1.8);

document.getElementById('startButton').addEventListener('click', onStartButtonClick);
document.getElementById('exitButton').addEventListener('click', onExitButtonClick);



// Create Scene Meshes
const Meshes = new SceneMeshes();
const obstacle = Meshes.createObstacle(obstaclePosition);
const cube = Meshes.createCube();

let  SculptureMesh;

try {
    Meshes.loadSculptureModel('Statue/12338_Statue_v1_L3.obj')
    .then((Mesh) => {
        SculptureMesh= Mesh;
    })
    .catch((error) => {
        console.error('Error loading sculpture:', error);
    });

    
} catch (error) {
    console.log(error);
}


//Handle Log
function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = message;
}


async function onStartButtonClick() {
    console.log("Start AR button clicked.");
    await startXR();
    toggleButtons(true); // Disable start button and enable exit button
}

function onExitButtonClick() {
    console.log("Exit AR button clicked.");
    if (session) {
        session.end();
        toggleButtons(false); // Enable start button and disable exit button
    }
}

function toggleButtons(isSessionActive) {
    const startButton = document.getElementById('startButton');
    const exitButton = document.getElementById('exitButton');

    if (isSessionActive) {
        startButton.disabled = true;
        startButton.style.display = 'none';
        exitButton.style.display = 'block';
    } else {
        startButton.disabled = false;
        startButton.style.display = 'block';
        exitButton.style.display = 'none';
    }
}

async function init() {
    try {
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!navigator.xr || !isSupported) {
            alert("WebXR or immersive-ar session is not supported on this device");
            console.error("WebXR not supported.");
            return false;
        }
        return true;
    } catch (error) {
        console.error("An error occurred:", error);
        return false;
    }
}

async function startXR() {
    if (!(await init())) {
        return;
    }
    try {

        const audioContext = new AudioContext();
        const roomSpatialAudio = new RoomSpatialAudio(audioContext, 'Audio/A.mp3', obstaclePosition );        
        const trackedImages = await setupImageTracking();

        session = await createXRSession(trackedImages);
        console.log("Immersive AR session started.");

        referenceSpace = await setupReferenceSpace(session);

        const { renderer, scene, camera, obstacle } = setupThreeJS();
        

        

        renderer.xr.setAnimationLoop((time, frame) => {

            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, obstacle, trackedImages);
            const userPosition1 = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

            roomSpatialAudio.updateListenerPosition(userPosition1.x, userPosition1.y, userPosition1.z,camera);

            //camera direction logic
            const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
            const meshPosition =   obstacle.position;
            const cameraPosition = camera.position;
            const directionToMesh = meshPosition.clone().sub(cameraPosition).normalize();

            const dotProduct = cameraDirection.dot(directionToMesh);

            if (dotProduct > 0.9) {
                logMessage("Camera is facing the mesh");
            } else {
                logMessage("Camera is not facing the mesh");
            }

        });

        console.log("XRFrame loop initiated.");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function setupImageTracking() {

    const trackedImages = [
        { index: 0, url: 'https://raw.githubusercontent.com/stemkoski/AR.js-examples/master/images/earth-flat.jpg', mesh: cube, widthInMeters: 0.5 },
        { index: 1, url: 'Images/QR.png', mesh: SculptureMesh, widthInMeters: 0.5 }

    ];
    const imageTrackables = [];
    for (const item of trackedImages) {
        const imageBitmap = await createXRImageBitmap(item.url);
        const newItem = {
            index: item.index,
            url: item.url,
            mesh: item.mesh,
            imageBitmap: imageBitmap,
            widthInMeters: item.widthInMeters
        };

        imageTrackables.push(newItem);
    }


    return imageTrackables;
}

// Function to handle AR object click (touchstart event)
function onTouchStart(event, raycaster, camera) {
 
    // Get touch position on screen
    const touch = event.touches[0];

    // Calculate normalized device coordinates (NDC)
    const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
    const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

    // Set up raycaster from the touch position
    raycaster.setFromCamera(new THREE.Vector2(touchX, touchY), camera);

    // Check for intersections with SculptureMesh
    const intersects = raycaster.intersectObject(obstacle);

    if (intersects.length > 0) {
        console.log('hit'); // Print "hit" when the object is touched
        event.preventDefault();
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

    // Raycaster for detecting clicks
    const raycaster = new THREE.Raycaster();
    
    // Create a controller for detecting the user's interactions (e.g., tapping)
    const controller = renderer.xr.getController(0);

      // Add the `touchstart` event listener to detect screen taps with passive: false
      window.addEventListener('touchstart', function (event) {
        onTouchStart(event, raycaster, camera);
    }, { passive: false }); 

    scene.add(obstacle);
    scene.add(cube);
    scene.add(SculptureMesh);
    scene.add(controller);


    return { renderer, scene, camera, obstacle };
}



function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, obstacle, trackedImages) {
    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    FindDistance(userPosition, obstacle, camera);
    PlaceObjectOnTarget(frame, referenceSpace, trackedImages);

    renderer.render(scene, camera);
}
