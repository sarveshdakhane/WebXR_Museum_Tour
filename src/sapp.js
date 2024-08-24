import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let container;
let camera, scene, renderer;
let controller, obstacle, cube;
let distanceText, color = 'green';
let session = null;
const obstaclePosition = new THREE.Vector3(0, 0, -1.8);
const safeDistance = 0.9;
let referenceSpace;
let trackedImages = [];

init();

async function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer, {
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
    }));

    // Create the obstacle
    const geometry = new THREE.BoxGeometry(0.5, 0.4, 0.1);
    const material = new THREE.MeshPhongMaterial({ color: color });
    obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.copy(obstaclePosition);
    scene.add(obstacle);

    // Create the cube
    const cubeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue color
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.visible = false; // Initially hidden
    scene.add(cube);

    // Text for displaying distance
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry('Distance: 0', {
            font: font,
            size: 0.1,
            depth: 0.01
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        distanceText = new THREE.Mesh(textGeometry, textMaterial);
        distanceText.position.set(0, 1, -1.8);
        scene.add(distanceText);
    });

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize, false);

    // Add event listener to the AR exit button
    const exitButton = document.getElementById('arExitButton');
    exitButton.addEventListener('click', exitARSession);

    renderer.xr.addEventListener('sessionstart', onSessionStart);
    renderer.xr.addEventListener('sessionend', onSessionEnd);

    // Handle the Start AR button click to start the session
    document.getElementById('startButton').addEventListener('click', async () => {
        try {
            console.log("Start AR button clicked.");

            // Image tracking setup
            const imageBitmap = await createXRImageBitmap('https://raw.githubusercontent.com/stemkoski/AR.js-examples/master/images/earth-flat.jpg');
            console.log("ImageBitmap created from 'earth-flat.jpg'.");

            trackedImages = [{
                image: imageBitmap,
                widthInMeters: 0.5
            }];

            // Request the AR session with image tracking
            session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['image-tracking'],
                trackedImages: trackedImages
            });

            renderer.xr.setSession(session);
        } catch (error) {
            console.error("An error occurred while starting the AR session:", error);
        }
    });
}

function calculateDistance(pos1, pos2) {
    return pos1.distanceTo(pos2);
}

function onSelect() {
    // Interaction event, if needed
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

async function onSessionStart(event) {
    session = event.target.getSession();

    referenceSpace = await session.requestReferenceSpace('local');
    session.updateRenderState({ baseLayer: new XRWebGLLayer(session, renderer.getContext()) });

    document.getElementById('arExitButton').style.display = 'block'; // Show exit button when AR session starts
    renderer.xr.setAnimationLoop(onXRFrame); // Start the animation loop
}

function onSessionEnd(event) {
    session = null;
    document.getElementById('arExitButton').style.display = 'none'; // Hide exit button when AR session ends
    renderer.setAnimationLoop(null); // Stop the animation loop
    console.log("AR session ended.");
}

async function createXRImageBitmap(url) {
    try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        await img.decode();
        console.log("Image loaded and decoded:", url);

        const bitmap = await createImageBitmap(img);
        console.log("ImageBitmap created successfully.");
        return bitmap;
    } catch (error) {
        console.error("Failed to create ImageBitmap from", url, error);
        throw error;
    }
}

function exitARSession() {
    if (session) {
        session.end();
        console.log("AR session manually ended by user.");
    }
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

    if (session && referenceSpace) {
        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            try {
                const results = frame.getImageTrackingResults(trackedImages);
                results.forEach((result) => {
                    console.log(`Tracking result: ${result.trackingState}`);

                    if (result.trackingState === 'tracked') {
                        const imagePose = frame.getPose(result.imageSpace, referenceSpace);
                        if (imagePose) {
                            console.log("Tracked image is visible and being processed.");
                            const position = imagePose.transform.position;
                            const orientation = imagePose.transform.orientation;

                            cube.position.set(position.x, position.y, position.z);
                            cube.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
                            cube.visible = true;
                        } else {
                            console.warn("Pose could not be obtained for the tracked image.");
                            cube.visible = false;
                        }
                    } else {
                        console.log("Image is not tracked. Hiding the cube.");
                        cube.visible = false;
                    }
                });
            } catch (e) {
                console.error("Image tracking results cannot be obtained because the session does not support image-tracking.");
            }
        } else {
            console.log("No viewer pose found.");
        }
    }

    renderer.render(scene, camera);
}
