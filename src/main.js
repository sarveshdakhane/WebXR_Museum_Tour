import * as THREE from 'three';
import { createXRImageBitmap, PlaceObjectOnTarget, FindDistance, IsCameraFacing , logMessage } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RoomSpatialAudio } from './SpatialAudio.js';
import { SceneMeshes } from './MeshesClass.js';

//Global Object Declaration
let session = null;
let referenceSpace = null;
let obstaclePosition = new THREE.Vector3(0, 0, -1.8);
let audioContext;
let roomSpatialAudio;        
let trackedImages;

document.getElementById('arButton').addEventListener('click', onARButtonClick);


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
            session.end();
            arButton.textContent = "Start AR"; // Switch back to Start
        }
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
        
        // All Scene object intialization 

        trackedImages = await setupImageTracking();

        audioContext = new AudioContext();

        roomSpatialAudio = new RoomSpatialAudio(audioContext);      

        roomSpatialAudio.addPositionBasedAudio('audio1', 'Audio/A.mp3', { x: obstacle.position.x , y: obstacle.position.y, z: obstacle.position.z });

        //roomSpatialAudio.addPositionBasedAudio('audio2', 'Audio/A2.mp3', { x: cube1.position.x , y: cube1.position.y, z: cube1.position.z });

        roomSpatialAudio.togglePositionBasedAudio('audio1', true);
       // roomSpatialAudio.togglePositionBasedAudio('audio2', true);
        
        // Adding background spatial audio with a unique ID
        roomSpatialAudio.addBackgroundAudio('background', 'Audio/Mining.mp3');
        roomSpatialAudio.toggleBackgroundAudio(true);



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
     
        session = await createXRSession(trackedImages);    

        referenceSpace = await setupReferenceSpace(session);

        console.log("Immersive AR session started.");

        const { renderer, scene, camera } = setupThreeJS(); 
        
        console.log("ThreeJS initialized");

        renderer.xr.setAnimationLoop((time, frame) => {

            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, obstacle, trackedImages);

        });


    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function setupImageTracking() {

    const trackedImages = [
        { index: 0, url: 'https://raw.githubusercontent.com/stemkoski/AR.js-examples/master/images/earth-flat.jpg', mesh: cube, widthInMeters: 0.5 },
        { index: 1, url: 'Images/p.png', mesh: SculptureMesh, widthInMeters: 0.5 }

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
 
    const touch = event.touches[0];
    const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
    const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(touchX, touchY), camera);

    const intersects = raycaster.intersectObject(obstacle);

    if (intersects.length > 0) {
        console.log('hit');
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


    return { renderer, scene, camera };
}

function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, obstacle, trackedImages) {

    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    // Calculate Distance Between Two Points
    FindDistance(userPosition, obstacle, camera);

    // Place 3D Object on the Target
    PlaceObjectOnTarget(frame, referenceSpace, trackedImages);

    // Spatial Audio Location updater
    roomSpatialAudio.updateListenerPosition(userPosition.x, userPosition.y, userPosition.z,camera);

    // IsCameraFacing the target
    if (IsCameraFacing(camera,obstacle ,new THREE.Vector3())) {

        logMessage("Camera is facing the mesh");
        } else {
            logMessage("Camera is not facing the mesh");
        }    

    renderer.render(scene, camera);
}
