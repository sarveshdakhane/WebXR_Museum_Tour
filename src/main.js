import * as THREE from 'three';
import { setupImageTrackingData, PlaceObjectsOnTarget, IsCameraFacing, logMessage } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { RoomSpatialAudio } from './SpatialAudio.js';
import { generalMeshes } from './data.js';

// Global Variables
let session = null;
let audioContext, roomSpatialAudio;
let SelectedObject = null;
let SelectedObjectAnimation = null;

const clock = new THREE.Clock();
document.getElementById('arButton').addEventListener('click', onARButtonClick);

async function startXR() {
    if (!(await checkSupport())) return;

    try {
        const { renderer, scene, camera, targetImagesData, referenceSpace } = await setupScene();
        console.log("Scene initialized");

        renderer.xr.setAnimationLoop((time, frame) => {
            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData);
        });

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function setupScene() {
    try {
        // Initialize Scene and XR Elements
        const targetImagesData = await setupImageTrackingData();
        session = (await createXRSession(targetImagesData)).session;
        const referenceSpace = await setupReferenceSpace(session);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        scene.add(camera);

        const light = new THREE.HemisphereLight(0xffffff, 0x444444);
        light.position.set(0, 1, 0);
        scene.add(light);

        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const gl = canvas.getContext('webgl2', { xrCompatible: true });

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas, context: gl });
        renderer.xr.enabled = true;
        renderer.xr.setReferenceSpaceType('local');
        renderer.xr.setSession(session);

        // Initialize Audio and Objects
        audioContext = new AudioContext();
        roomSpatialAudio = new RoomSpatialAudio(audioContext);

        const interactablesObjects = setupInteractableObjects(scene, targetImagesData);

        // Set up background spatial audio
        roomSpatialAudio.addBackgroundAudio('background', 'Audio/Mining.mp3');
        roomSpatialAudio.toggleBackgroundAudio(true);

        // Raycaster for detecting clicks and object interaction
        const raycaster = new THREE.Raycaster();
        window.addEventListener('touchstart', (event) => {
            onObjectClick(event, raycaster, camera, interactablesObjects);
        }, { passive: true });

        return { renderer, scene, camera, targetImagesData, referenceSpace };

    } catch (error) {
        console.error("An error occurred in setupScene:", error);
    }
}

// Helper to set up interactable objects from data
function setupInteractableObjects(scene, targetImagesData) {
    const interactablesObjects = [];

    /*
    generalMeshes.forEach((item) => {
        roomSpatialAudio.addPositionBasedAudio(item.id, item.audioFile , { x: item.mesh.position.x , y: item.mesh.position.y, z: item.mesh.position.z });
        //roomSpatialAudio.togglePositionBasedAudio(item.id, true);
        scene.add(item.mesh); 
        interactablesObjects.push(item.mesh);
    });
    */
    targetImagesData.forEach((items) => {
        items.meshes.forEach((item) => {
            scene.add(item.mesh);
            interactablesObjects.push(item);
        });
    });

    return interactablesObjects;
}

// Frame update for XR
function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData) 
{
    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    // Place 3D Object on the Target and update spatial audio listener
    PlaceObjectsOnTarget(frame, referenceSpace, targetImagesData, userPosition);

    // Update the Spatial Audio
    roomSpatialAudio.updateListenerPosition(camera, userPosition);

    // Play animation if an object is selected
    PlayMeshAnimation();

    /* IsCameraFacing the target
    if (IsCameraFacing(camera, obstacle, new THREE.Vector3())) {
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
        hideElementsWithMetadata();
        console.log("Start AR button clicked.");
        await startXR();
        arButton.textContent = "Stop AR";
    } else {
        location.reload();
        console.log("Stop AR button clicked.");
        if (session) {
            roomSpatialAudio.closeAllAudio();
            session.end();
            arButton.textContent = "Start AR";
        }
    }
}

async function checkSupport() {
    try {
        const isSupported = await navigator.xr?.isSessionSupported('immersive-ar');
        if (!isSupported) {
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

// Play selected object's animation
function PlayMeshAnimation() {
    if (SelectedObjectAnimation) {
        const delta = clock.getDelta();
        SelectedObjectAnimation.update(delta);
    }
}

// Handle AR object click (touchstart event)
function onObjectClick(event, raycaster, camera, interactablesObjects) {
    const touch = event.touches[0];
    const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
    const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(touchX, touchY), camera);

    const allMeshes = interactablesObjects.map(item => item.mesh);
    const intersects = raycaster.intersectObjects(allMeshes, true);

    if (intersects.length > 0) {
        handleObjectSelection(intersects[0], interactablesObjects);
    }
}

// Handle object selection and setup animation/audio
function handleObjectSelection(intersectedObject, interactablesObjects) {


    const clickedObjectName = intersectedObject.object.name;    

    // Deselect previous object
    if (SelectedObject) roomSpatialAudio.togglePositionBasedAudio(SelectedObject.object.name, false);
    
    // Select new object
    SelectedObject = intersectedObject;
    console.log('Clicked object name:', clickedObjectName);

    const data = interactablesObjects.find(entry => entry.mesh.name === clickedObjectName);

    if (data && data.clickable === true ) {

                SelectedObjectAnimation = null;        
                SelectedObjectAnimation = data.Animation;  
           
                roomSpatialAudio.addPositionBasedAudio(clickedObjectName, data.audioFile, {
                    x: SelectedObject.point.x,
                    y: SelectedObject.point.y,
                    z: SelectedObject.point.z
                });
        
                roomSpatialAudio.togglePositionBasedAudio(clickedObjectName, true);            
       
    }
}

// Hide elements with metadata attribute
function hideElementsWithMetadata() {
    document.querySelectorAll('div[metadata="Hide"]').forEach(element => {
        element.style.display = 'none';
    });
}
