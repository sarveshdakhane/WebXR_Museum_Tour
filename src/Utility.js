import { targetImagesData } from './data.js';

//Handle Log
export function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    logContainer.innerHTML = message;
}

export function FindSafeDistanceBetweenUserandExhibit(userPosition, position, item)
{
        const safeDistance = 0.8;

        if (userPosition.distanceTo(position) < safeDistance) {
 
            toggleWarning(item,true);

        } else {

            toggleWarning(item,false);

        }
}

export async function setupImageTrackingData() {
    
    const imageTrackables = [];
    for (const item of targetImagesData) {
        const imageBitmap = await createXRImageBitmap(item.url);
        const newItem = {
            index: item.index,
            Name: item.Name,
            url: item.url,
            meshes: item.meshes,
            imageBitmap: imageBitmap,
            imageWidth: item.imageWidth,
            imageHeight: item.imageHeight,
            isAlreadyTracked:  item.isAlreadyTracked
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

        // Hide all meshes if tracking data is unavailable
        trackedImages.forEach(trackedImageIndex => {
            TrackedImageDataInUse(trackedImageIndex, null, false, userPosition);
            trackedImageIndex.isAlreadyTracked = false; // Reset tracking flag
        });
        return;
    }

    const results = frame.getImageTrackingResults();

    trackedImages.forEach((trackedImageIndex) => {
        const result = results.find(r => r.index === trackedImageIndex.index);

        const imagePose = result && result.trackingState === 'tracked' 
            ? frame.getPose(result.imageSpace, referenceSpace) 
            : null;

        const isVisible = imagePose !== null;

        if (isVisible && !trackedImageIndex.isAlreadyTracked) {
            // Only update position once when the object is first tracked
            TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible);
            trackedImageIndex.isAlreadyTracked = true;
        }

        if (isVisible && imagePose)
        {
            FindSafeDistanceBetweenUserandExhibit(userPosition, imagePose.transform.position, trackedImageIndex.Name);
        }

    });
}

function TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible) {

    if (!trackedImageIndex.meshes || trackedImageIndex.meshes.length === 0) {
        return;
    }

    if (isVisible && imagePose) {

        const { imageWidth , imageHeight} = trackedImageIndex;
        const position = imagePose.transform.position;

        // First mesh Position 
        const firstMesh = trackedImageIndex.meshes[0];

        if (firstMesh) {
            firstMesh.mesh.position.set(
                position.x + firstMesh.position.x,        
                position.y + firstMesh.position.y,             
                position.z + firstMesh.position.z
            );
            firstMesh.mesh.visible = true;
        }

        // Second mesh Position 
        const SecondMesh = trackedImageIndex.meshes[1];
        if (SecondMesh) {
            SecondMesh.mesh.position.set(
                position.x + SecondMesh.position.x,        
                position.y + SecondMesh.position.y,             
                position.z + SecondMesh.position.z
            );
            SecondMesh.mesh.visible = true;
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


export function toggleWarning(objectName, visibility) {
    const warningDiv = document.getElementById("Warrning");
    const warningText = warningDiv.querySelector("h2");

    // Update the text in the h2 tag with the provided object name
    warningText.textContent = `Please keep a safe distance from the ${objectName}. Thank you!`;

    // Set visibility based on the boolean value
    if (visibility) {
        warningDiv.style.display = "block"; // Show the div
    } else {
        warningDiv.style.display = "none"; // Hide the div
    }
}

export function hideElementsWithMetadata() {
    document.querySelectorAll('div[metadata="Hide"]').forEach(element => {
        element.style.display = 'none';
    });
}

export async function checkSupport() {
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