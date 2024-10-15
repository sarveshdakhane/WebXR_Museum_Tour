import * as THREE from 'three';
import { setupImageTrackingData, PlaceObjectsOnTarget, FindDistance, IsCameraFacing , logMessage } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { RoomSpatialAudio } from './SpatialAudio.js';
import { generalMeshes } from './data.js';


//Global Variables Declaration
let session = null;
let audioContext;
let roomSpatialAudio;        
document.getElementById('arButton').addEventListener('click', onARButtonClick);

async function startXR() {
    if (!(await checkSupport())) {
        return;
    }
    try {

        const { renderer, scene, camera , targetImagesData , referenceSpace } = await setupScene();         
        
        console.log("Scene initialized");

        renderer.xr.setAnimationLoop((time, frame) => {

            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData);

        });


    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function setupScene() {

    let targetImagesData = await setupImageTrackingData();   

    session = await createXRSession(targetImagesData);   

    let referenceSpace = await setupReferenceSpace(session);

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
        //onTouchStart(event, raycaster, camera);
    }, { passive: false }); 


    // Intialize Scene Actors Data   
    audioContext = new AudioContext();
    roomSpatialAudio = new RoomSpatialAudio(audioContext); 

    generalMeshes.forEach((item) => {

        roomSpatialAudio.addPositionBasedAudio(item.id, item.audioFile , { x: item.mesh.position.x , y: item.mesh.position.y, z: item.mesh.position.z });
        roomSpatialAudio.togglePositionBasedAudio(item.id, true);
        scene.add(item.mesh); 

    });

    // Adding background spatial audio with a unique ID
    roomSpatialAudio.addBackgroundAudio('background', 'Audio/Mining.mp3');
    roomSpatialAudio.toggleBackgroundAudio(true);
    
    targetImagesData.forEach((items) => {
        items.meshes.forEach((item) => {
            scene.add(item.mesh); 
        });
    });

    return { renderer, scene, camera , targetImagesData , referenceSpace};
}

function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData) {

    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    // Calculate Distance Between Two Points
    //FindDistance(userPosition, obstacle, camera);

    // Place 3D Object on the Target
    PlaceObjectsOnTarget(frame, referenceSpace, targetImagesData);

    // Spatial Audio Location updater
    roomSpatialAudio.updateListenerPosition(userPosition.x, userPosition.y, userPosition.z,camera);

    /* IsCameraFacing the target
    if (IsCameraFacing(camera,obstacle ,new THREE.Vector3())) {

        logMessage("Camera is facing the mesh");
        } else {
            logMessage("Camera is not facing the mesh");
        }
            
    */        
    renderer.render(scene, camera);
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

async function checkSupport() {
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


/* Function to handle AR object click (touchstart event)
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
*/
