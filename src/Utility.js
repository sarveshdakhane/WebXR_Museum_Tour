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

        if (userPosition.distanceTo(position) < safeDistance) {
            item.mesh.material.color.set(0xFF0000);
        }         
        else { 
            item.mesh.material.color.set(0x0000ff);
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

export function PlaceObjectsOnTarget(frame, referenceSpace, trackedImages , userPosition) {

    const pose = frame.getViewerPose(referenceSpace);
    if (!pose) {
        console.log("No viewer pose found.");
        return;
    }

    const results = frame.getImageTrackingResults();
    results.forEach((result) => {

        // Get the image's pose if it's tracked
        const imagePose = result.trackingState === 'tracked' ? frame.getPose(result.imageSpace, referenceSpace) : null;        

        const isVisible = imagePose !== null; 

        if (isVisible) {

            const trackedImageIndex = trackedImages.find(item => item.index === result.index);

            if (!trackedImageIndex) {

                console.warn("No matching tracked image index found for this result.");
                return;
            }  

           TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible, userPosition);
        } 
        else 
        {
            trackedImages.forEach(trackedImageIndex => {
            TrackedImageDataInUse(trackedImageIndex, null, false, userPosition);
            });
        }
    });
}

function TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible ,userPosition) {

    if (!trackedImageIndex.meshes || trackedImageIndex.meshes.length === 0) {
        return;
    }

    if (isVisible && imagePose) {

        const { imageWidth, imageHeight } = trackedImageIndex;
        const position = imagePose.transform.position;

        // Get the total number of meshes
        const totalMeshes = trackedImageIndex.meshes.length;

        // Calculate a radius based on the size of the image and number of meshes
        const radiusX = imageWidth * 0.5;
        const radiusY = imageHeight * 0.5;

        // Loop through each mesh and distribute them around the image dynamically
        trackedImageIndex.meshes.forEach((item, index) => {

            // Calculate angle for each mesh to distribute them evenly
            const angle = (Math.PI * 2 / totalMeshes) * index;

            // Dynamically calculate position offsets based on the angle
            const offsetX = Math.cos(angle) * radiusX;
            const offsetY = Math.sin(angle) * radiusY;

            item.mesh.position.set(
                position.x + offsetX,
                position.y + offsetY,
                position.z
            );

            item.mesh.visible = true;
            FindSafeDistanceBetweenUserandExhibit(userPosition,position,item);

        });

    } else {
        // If the image is not tracked, hide all meshes
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