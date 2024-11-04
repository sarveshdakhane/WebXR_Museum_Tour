import * as THREE from 'three';
import { setupImageTrackingData, PlaceObjectsOnTarget, IsCameraFacing, logMessage, hideElementsWithMetadata, checkSupport } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { RoomSpatialAudio } from './SpatialAudio.js';
import { SpatialAudioObjects } from './data.js';

let session = null;
let audioContext = null;
let roomSpatialAudio = null;

const arButton = document.getElementById('arButton');

// Event listener for AR button, with cleanup on reload
arButton.addEventListener('click', onARButtonClick);

async function startXR() 
{
    if (!(await checkSupport())) return;

    try {
        const { renderer, scene, camera, referenceSpace } = await setupScene();
        console.log("Scene initialized");

        renderer.xr.setAnimationLoop((time, frame) => {
            onXRFrame(time, frame, renderer, referenceSpace, scene, camera);
        });
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function setupScene() {
    try {

        session = (await createXRSession(null)).session;
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
        audioContext = new AudioContext();
        roomSpatialAudio = new RoomSpatialAudio(audioContext, 1.5, 0.6, 0.01, handleAudioEnd);
       // roomSpatialAudio.addBackgroundAudio('background', 'Audio/A.mp3');
       // roomSpatialAudio.toggleBackgroundAudio(true);

        setupObjects(scene);

        return { renderer, scene, camera, referenceSpace };

    } catch (error) {
        console.error("An error occurred in setupScene:", error);
    }
}

// Sets up interactable objects, optimizing memory by using references directly
function setupObjects(scene) {

    SpatialAudioObjects.forEach(item => {

     
        item.mesh.visible = true;
        scene.add(item.mesh);


        item.mesh.traverse((child) => {

            const worldPosition = new THREE.Vector3();

            if (child.name === 'chariot') {

                let chariot = child.getWorldPosition(worldPosition);
   
                roomSpatialAudio.addPositionBasedAudio('chariot', "Audio/A.mp3", {
                x: chariot.x,
                y: chariot.y,
                z: chariot.z             
            });      

                roomSpatialAudio.togglePositionBasedAudio('chariot', true); 
             }



            if (child.name === 'Man') {

                let Man = child.getWorldPosition(worldPosition);           

            roomSpatialAudio.addPositionBasedAudio('Man', "Audio/A2.mp3", {
                x: Man.x,
                y: Man.y,
                z: Man.z

            });

            roomSpatialAudio.togglePositionBasedAudio('Man', true); 
        }

           
        });

            

            roomSpatialAudio.addPositionBasedAudio(item.id, item.audioFile, {
                x: item.mesh.position.x,
                y: item.mesh.position.y,
                z: item.mesh.position.z
            });
            roomSpatialAudio.togglePositionBasedAudio(item.id, false);        
    });
}

// XR frame loop with efficient rendering
function onXRFrame(time, frame, renderer, referenceSpace, scene, camera) {

    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    
    //FindSafeDistanceBetweenUserandExhibit(userPosition, imagePose.transform.position, trackedImageIndex.Name, roomSpatialAudio);
    roomSpatialAudio.updateListenerPositionSpatialRoom(camera, userPosition);

    renderer.render(scene, camera);
}

// Starts or stops AR, reloading page for cleanup
async function onARButtonClick() {
    if (arButton.textContent === "Start AR") {
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

function handleAudioEnd(audioId) {

        console.log(`Stopped animation for ${audioId}`);

}
