import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let container;
let camera, scene, renderer;
let controller, obstacle;
let distanceText, color = 'green';
let session = null;
const obstaclePosition = new THREE.Vector3(0, 0, -1.8);
const safeDistance = 0.9;
let trackedImages=null;
let referenceSpace = null;


init();

document.getElementById('startButton').addEventListener('click', () => {
    console.log("Start AR button clicked.");
    startXR();
});


async function onSessionStart(event) {
    session = event.target.getSession();

    referenceSpace = await session.requestReferenceSpace('local');
    console.log("Reference space set up.");

    // Image tracking setup
    const imageBitmap = await createXRImageBitmap('https://raw.githubusercontent.com/stemkoski/AR.js-examples/master/images/earth-flat.jpg');
    console.log("ImageBitmap created from 'earth-flat.jpg'.");

    trackedImages = [
        {
            image: imageBitmap,
            widthInMeters: 0.5
        }
    ];

    startXR();
    console.log("AR session Started.");
}

function onSessionEnd(event) {
    session = null;  
    renderer.setAnimationLoop(null);
    console.log("AR session ended.");
}

async function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);


    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl2', { xrCompatible: true });


    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true , canvas:canvas, context:gl});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);


    document.body.appendChild(ARButton.createButton(renderer, {
        optionalFeatures: ['dom-overlay', 'image-tracking'],
        5: { root: document.body }
    }));





    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local');
    renderer.xr.setSession(session);
    console.log("Renderer configured for WebXR.");

    // Create the obstacle
    const geometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
    const material = new THREE.MeshPhongMaterial({ color: color });
    obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.copy(obstaclePosition);
    scene.add(obstacle);

    controller = renderer.xr.getController(0);
    scene.add(controller);

    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);
}


function onXRFrame(time, frame) {
    if (obstacle && camera) {
        const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
        const distance = calculateDistance(userPosition, obstacle.position);

        // Update color based on distance
        if (distance < safeDistance) {
            color = 'red';
        } else {
            color = 'green';
        }
        obstacle.material.color.set(color);

        // Update distance text
        if (distanceText) {
            distanceText.geometry.dispose();
            distanceText.geometry = new TextGeometry(`Distance: ${distance.toFixed(2)}`, {
                font: distanceText.geometry.parameters.font,
                size: 0.1,
                height: 0.01
            });
        }
    }

    const pose = frame.getViewerPose(referenceSpace);

    if (pose) {
        const r = frame.getImageTrackingResults(trackedImages);
    }
    else{
        console.log("No pose");
    }

    renderer.render(scene, camera);
}


async function startXR() {


    renderer.xr.setAnimationLoop(onXRFrame);
   
   

}

