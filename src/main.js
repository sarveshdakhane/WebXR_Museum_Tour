import * as THREE from 'three';
import { setupImageTrackingData, PlaceObjectsOnTarget, IsCameraFacing, logMessage, hideElementsWithMetadata, checkSupport } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { RoomSpatialAudio } from './SpatialAudio.js';


let session = null;
let audioContext = null;
let roomSpatialAudio = null;
let SelectedObject = null;
let SelectedObjectAnimation = null;

const clock = new THREE.Clock();
const arButton = document.getElementById('arButton');

// Event listener for AR button, with cleanup on reload
arButton.addEventListener('click', onARButtonClick);

async function startXR() {
    if (!(await checkSupport())) return;

    try {
        if (!audioContext) {
            audioContext = new AudioContext();
        }

        // Resume AudioContext if it is suspended
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const { renderer, scene, camera, targetImagesData, referenceSpace } = await setupScene();

        // Start background audio after setup is complete
        roomSpatialAudio.toggleBackgroundAudio(true);

        renderer.xr.setAnimationLoop((time, frame) => {
            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData);
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}


async function setupScene() {
    try {
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

        // Audio setup with cleanup on close
       
        roomSpatialAudio = new RoomSpatialAudio(audioContext, 1.5, 0.6, 0.01, handleAudioEnd);
        roomSpatialAudio.addBackgroundAudio('background', 'Audio/baroque.mp3');
        roomSpatialAudio.toggleBackgroundAudio(true);
    
        //roomSpatialAudio.togglePositionBasedAudio('background',true);

        // Interactable objects setup
        const interactablesObjects = setupInteractableObjects(scene, targetImagesData);

        // Raycaster for object interaction, with touch event listener cleanup on session end
        const raycaster = new THREE.Raycaster();
        const onTouchStart = (event) => onObjectClick(event, raycaster, camera, interactablesObjects);
        window.addEventListener('touchstart', onTouchStart, { passive: true });

        // Remove touch event listener when session ends
        session.addEventListener('end', () => {
            window.removeEventListener('touchstart', onTouchStart);
            roomSpatialAudio.closeAllAudio();
        });

        return { renderer, scene, camera, targetImagesData, referenceSpace };
    } catch (error) {
        console.error("An error occurred in setupScene:", error);
    }
}

// Sets up interactable objects, optimizing memory by using references directly
function setupInteractableObjects(scene, targetImagesData) {
    const interactablesObjects = [];
    targetImagesData.forEach(items => {
        items.meshes.forEach(item => {
            scene.add(item.mesh);
            interactablesObjects.push(item); // Avoid adding .mesh for a cleaner object structure
        });
    });
    return interactablesObjects;
}

// XR frame loop with efficient rendering
function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData) {
    
    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    // Update spatial audio listener and place 3D objects
    PlaceObjectsOnTarget(frame, referenceSpace, targetImagesData, userPosition, roomSpatialAudio);

    roomSpatialAudio.updateListenerPosition(camera, userPosition);

    if (SelectedObjectAnimation) {
         PlayMeshAnimation();
    }
   //logMessage("Camera is facing the mesh"); // Assume this runs only if debugging; consider removing in production

    renderer.render(scene, camera);
}

// Starts or stops AR, reloading page for cleanup
async function onARButtonClick() {
    if (arButton.textContent === "Start AR") {
        // Resume AudioContext if it exists and is suspended
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        hideElementsWithMetadata();
        await startXR();
        arButton.textContent = "Stop AR";
    } else {
        if (session) {
            roomSpatialAudio.closeAllAudio();
            await session.end();
        }
        location.reload(); // Full reload to clear up resources
    }
}


// Plays animation for the selected object
function PlayMeshAnimation() {
    const delta = clock.getDelta();
    SelectedObjectAnimation.update(delta);
}

// Handles object selection, with optimized resource management for audio and animation
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

// Optimized object selection, reusing objects and avoiding redundant audio creation
async function handleObjectSelection(intersectedObject, interactablesObjects) {
    const clickedObjectName = intersectedObject.object.name;
    console.log("here clicked", clickedObjectName);

    const data = interactablesObjects.find(entry => entry.mesh.name === clickedObjectName);

    if (data && data.clickable) {
        if (SelectedObject) {
           // roomSpatialAudio.togglePositionBasedAudio(SelectedObject.object.name, false);
            SelectedObject = null;
        }

        SelectedObject = intersectedObject;
        SelectedObjectAnimation = data.Animation;

        if (!roomSpatialAudio.positionBasedAudios[clickedObjectName]) {
            console.log("Adding audio for:", clickedObjectName);
            roomSpatialAudio.addPositionBasedAudio(clickedObjectName, data.audioFile, {
                x: intersectedObject.point.x,
                y: intersectedObject.point.y,
                z: intersectedObject.point.z
            });

            // Ensure audio setup completes before toggling playback
            setTimeout(() => {
                roomSpatialAudio.togglePositionBasedAudio(clickedObjectName, true);
            }, 300); // Delay to ensure audio is set up
        }
    }
}


// Handles ending audio and cleanup
function handleAudioEnd(audioId) {
    if (SelectedObject && SelectedObject.object.name === audioId) {
        SelectedObjectAnimation = null;
    }
}
