import * as THREE from 'three';
import { createXRImageBitmap, PlaceObjectOnTarget, FindDistance } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RoomSpatialAudio } from './SpatialAudio.js';



let session = null;
let referenceSpace = null;
const obstaclePosition = new THREE.Vector3(0, 0, -1.8);
let color = 'green';

document.getElementById('startButton').addEventListener('click', onStartButtonClick);
document.getElementById('exitButton').addEventListener('click', onExitButtonClick);

//Create all the meshes here

const objLoader = new OBJLoader();
    
let cube1 ;


objLoader.load(
'Statue/12338_Statue_v1_L3.obj',
(object) => {
    
    cube1 = object;
    // Adjust the position, scale, and rotation as necessary
    cube1.position.set(0, 0, -3);
    cube1.scale.set(0.005, 0.005, 0.005);
    cube1.rotation.set(0, -40,0);
    cube1.visible=false;

},
)
//cube1.visible = false;



const Ogeometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
const Omaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
const obstacle = new THREE.Mesh(Ogeometry, Omaterial);
obstacle.position.copy(obstaclePosition);

const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(geometry, material);
cube.visible = false;

const geometry1 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material1 = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
//const cube1 = new THREE.Mesh(geometry1, material1);
//cube1.visible = false;


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
        const roomSpatialAudio = new RoomSpatialAudio(audioContext, 'A.mp3', obstaclePosition );        
        const trackedImages = await setupImageTracking();

        session = await createXRSession(trackedImages);
        console.log("Immersive AR session started.");

        referenceSpace = await setupReferenceSpace(session);

        const { renderer, scene, camera, obstacle } = setupThreeJS();


 

        

        

        renderer.xr.setAnimationLoop((time, frame) => {

            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, obstacle, trackedImages);
            const userPosition1 = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
            const resultString = `x: ${userPosition1.x}, y: ${userPosition1.y}, z: ${userPosition1.z}`;
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
        { index: 1, url: 'QR.png', mesh: cube1, widthInMeters: 0.5 }

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

// Function to handle AR object click (selectstart event)
async function onSelectStart(event,raycaster,controller,renderer) {

    const controllerPose = frame.getPose(
        controller.gripSpace || controller.targetRaySpace,
        renderer.xr.getReferenceSpace()
    );

    if (controllerPose) {
        // Set the raycaster from the controller's position and direction
        const origin = new THREE.Vector3().fromArray(controllerPose.transform.position);
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
            new THREE.Quaternion().fromArray(controllerPose.transform.orientation)
        );

        raycaster.set(origin, direction);

        const intersects = raycaster.intersectObject(cube1);

        if (intersects.length > 0) {
            console.log('hit'); // Print "hit" when the object is clicked
        }
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
    controller.addEventListener('selectstart', function (event) {
        onSelectStart(event, raycaster,controller,renderer);
    });
    scene.add(obstacle);
    scene.add(cube);
    scene.add(cube1);
    scene.add(controller);


    return { renderer, scene, camera, obstacle };
}



function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, obstacle, trackedImages) {
    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    FindDistance(userPosition, obstacle, camera);
    PlaceObjectOnTarget(frame, referenceSpace, trackedImages);

    renderer.render(scene, camera);
}
