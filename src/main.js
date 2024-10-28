import * as THREE from 'three';
import { setupImageTrackingData, PlaceObjectsOnTarget, IsCameraFacing , logMessage } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';
import { RoomSpatialAudio } from './SpatialAudio.js';
import { generalMeshes } from './data.js';


//Global Variables Declaration
let session = null;
let audioContext;
let roomSpatialAudio; 
let SelectedObject = null;       
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

    try
    {  

    let targetImagesData = await setupImageTrackingData();   

    session = (await createXRSession(targetImagesData)).session;   

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

    // Intialize Scene Actors Data   
    audioContext = new AudioContext();
    roomSpatialAudio = new RoomSpatialAudio(audioContext); 

    var interactablesObjects = [];

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

    // Adding background spatial audio with a unique ID
    roomSpatialAudio.addBackgroundAudio('background', 'Audio/Mining.mp3');
    roomSpatialAudio.toggleBackgroundAudio(true);

    // Raycaster for detecting clicks and Object Interaction
    const raycaster = new THREE.Raycaster();
    
      // Add the `touchstart` event listener to detect screen taps with passive: false
    window.addEventListener('touchstart', function (event) {
        onObjectClick(event, raycaster, camera ,interactablesObjects);
    }, { passive: true }); 

    return { renderer, scene, camera , targetImagesData , referenceSpace};

}
 catch (error) {
    console.error("An error occurred at setupScene()", error);   
}
}

function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, targetImagesData) {

    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    // Place 3D Object on the Target
    PlaceObjectsOnTarget(frame, referenceSpace, targetImagesData , userPosition );

    // Spatial Audio Location updater
    roomSpatialAudio.updateListenerPosition(camera, userPosition);

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

        hideElementsWithMetadata();
        console.log("Start AR button clicked.");

        await startXR();

        arButton.textContent = "Stop AR"; // Switch to Stop
    } else {
        location.reload();
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


// Function to Handle AR Object Click (touchstart event)
function onObjectClick(event, raycaster, camera , interactablesObjects) {
 
    const touch = event.touches[0];
    const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
    const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(touchX, touchY), camera);

    const AllMeshes = interactablesObjects.map(item => item.mesh);
    const intersects = raycaster.intersectObjects(AllMeshes,true);

    if (intersects.length > 0 && intersects[0].object.name) {

        const clickedObjectName = intersects[0].object.name;
    
        // Check if there is a SelectedObject and if it's different from the new intersected object
        if (!SelectedObject || SelectedObject.object.name !== clickedObjectName) {
     
            if (SelectedObject) {
                roomSpatialAudio.togglePositionBasedAudio(SelectedObject.object.name, false);
            }    

            SelectedObject = intersects[0];
            console.log('Clicked object name:', clickedObjectName);
    
            const Audio = interactablesObjects.find(entry => entry.mesh.name === clickedObjectName);

            if (Audio) {
                roomSpatialAudio.addPositionBasedAudio(clickedObjectName, Audio.audioFile, {
                    x: SelectedObject.point.x,
                    y: SelectedObject.point.y,
                    z: SelectedObject.point.z
                });
                roomSpatialAudio.togglePositionBasedAudio(clickedObjectName, true);
            }
        }
    }    
}
function hideElementsWithMetadata() {
    const elementsToHide = document.querySelectorAll('div[metadata="Hide"]');
    elementsToHide.forEach(element => {
        element.style.display = 'none';
    });
}
