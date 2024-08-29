import * as THREE from 'three';
import { createXRImageBitmap, PlaceObjectOnTarget, FindDistance } from './Utility.js';
import { createXRSession, setupReferenceSpace } from './XRSetup.js';

let session = null;
let referenceSpace = null;
const obstaclePosition = new THREE.Vector3(0, 0, -1.8);
let color = 'green';

document.getElementById('startButton').addEventListener('click', onStartButtonClick);
document.getElementById('exitButton').addEventListener('click', onExitButtonClick);

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

        const trackedImages =  await setupImageTracking();

        session = await createXRSession(trackedImages);
        console.log("Immersive AR session started.");

        referenceSpace = await setupReferenceSpace(session);

        const { renderer, scene, camera, cube, obstacle, cube1} = setupThreeJS();

        renderer.xr.setAnimationLoop((time, frame) => {
            onXRFrame(time, frame, renderer, referenceSpace, scene, camera, cube, trackedImages, obstacle , cube1);
        });

        console.log("XRFrame loop initiated.");
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function setupImageTracking() {

    const url1 = 'https://raw.githubusercontent.com/stemkoski/AR.js-examples/master/images/earth-flat.jpg';
    const url2='QR.png';


    

    const imageBitmap1 = await createXRImageBitmap(url1);
    const imageBitmap2 = await createXRImageBitmap(url2);

    console.log("ImageBitmap created from 'earth-flat.jpg'.");

    return [
        {
            image: imageBitmap1,
            widthInMeters: 0.5
        },
        {
            image: imageBitmap2,
            widthInMeters: 0.5
        }
    ];
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

    const Ogeometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
    const Omaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
    const obstacle = new THREE.Mesh(Ogeometry, Omaterial);
    obstacle.position.copy(obstaclePosition);
    scene.add(obstacle);

    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const cube = new THREE.Mesh(geometry, material);
    cube.visible = false;
    scene.add(cube);

    const geometry1 = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material1 = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
    const cube1 = new THREE.Mesh(geometry1, material1);
    cube.visible = false;
    scene.add(cube1);


    return { renderer, scene, camera, cube, obstacle ,  cube1 };
}

function onXRFrame(time, frame, renderer, referenceSpace, scene, camera, cube, trackedImages, obstacle , cube1) {
    const userPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

    FindDistance(userPosition, obstacle, camera);
    PlaceObjectOnTarget(frame, referenceSpace, cube, cube1);

    renderer.render(scene, camera);
}
