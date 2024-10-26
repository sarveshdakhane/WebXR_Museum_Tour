import { targetImagesData } from './data.js';
import * as THREE from 'three';


//Handle Log
export function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = message;
}

export function FindSafeDistanceBetweenUserandExhibit(userPosition, position, item)
{
        const safeDistance = 1.2;
        const mesh = item.mesh;

        if (userPosition.distanceTo(position) < safeDistance) {
 
            if (mesh) {
                 mesh.visible = false; 
            }
        } else {
            if (mesh) {
                mesh.visible = true; 
            }
        }
             
}

export async function setupImageTrackingData() {
    
    const imageTrackables = [];
    for (const item of targetImagesData) {
        const imageBitmap = await createXRImageBitmap(item.url);
        const newItem = {
            index: item.index,
            url: item.url,
            meshes: item.meshes,
            imageBitmap: imageBitmap,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight
        };
        imageTrackables.push(newItem);
    }
    return imageTrackables;
}

export async function createXRImageBitmap(url) {
    try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        await img.decode();    
        const bitmap = await createImageBitmap(img);
        return bitmap;
    } catch (error) {
        console.error("Failed to create ImageBitmap from", url, error);
        throw error;
    }
}

export function PlaceObjectsOnTarget(frame, referenceSpace, trackedImages, userPosition) {
    const pose = frame.getViewerPose(referenceSpace);
    if (!pose) {
        console.log("No viewer pose found.");

        // Hide all meshes in trackedImages since no pose means no tracking data available
        trackedImages.forEach(trackedImageIndex => {
            TrackedImageDataInUse(trackedImageIndex, null, false, userPosition);
        });

        return;
    }

    const results = frame.getImageTrackingResults();

    // Iterate through all trackedImages to update their state based on the results
    trackedImages.forEach((trackedImageIndex) => {

        const result = results.find(r => r.index === trackedImageIndex.index);

        const imagePose = result && result.trackingState === 'tracked' 
            ? frame.getPose(result.imageSpace, referenceSpace) 
            : null;
        
        const isVisible = imagePose !== null;

        TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible, userPosition);
    });
}


function TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible, userPosition) {

    if (!trackedImageIndex.meshes || trackedImageIndex.meshes.length === 0) {
        return;
    }

    if (isVisible && imagePose) {

        const { imageWidth , imageHeight} = trackedImageIndex;
        const position = imagePose.transform.position;

        const yOffset = position.y - (imageHeight / 2) - 0.05;


        // First mesh Position 
        const firstMesh = trackedImageIndex.meshes[0];

        if (firstMesh) {
            firstMesh.mesh.position.set(
                position.x,        
                position.y - 0.1,             
                position.z
            );

            firstMesh.mesh.visible = true;
            //FindSafeDistanceBetweenUserandExhibit(userPosition, position, firstMesh);
        }

        // Second mesh Position 
        const SecondMesh = trackedImageIndex.meshes[1];

        if (SecondMesh) {
            SecondMesh.mesh.position.set(
                position.x,        
                yOffset - 0.1,             
                position.z + 0.5
            );

            SecondMesh.mesh.visible = true;
           // FindSafeDistanceBetweenUserandExhibit(userPosition, position, SecondMesh);
        }

    } else {

        trackedImageIndex.meshes.forEach(item => {
            item.mesh.visible = false;
        });
    }
}


export function IsCameraFacing (camera, target_Object, location)
{
    //camera direction logic
    const cameraDirection = camera.getWorldDirection(location);
    const meshPosition =   target_Object.position;
    const cameraPosition = camera.position;
    const directionToMesh = meshPosition.clone().sub(cameraPosition).normalize();
    const dotProduct = cameraDirection.dot(directionToMesh);

    if (dotProduct > 0.9) {
        return true;
    } else {
        return false;
    }
}