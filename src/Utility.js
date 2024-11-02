import { targetImagesData } from './data.js';

let trackedTargetData = [];

export function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
        logContainer.innerHTML = message;
    }
}

export function FindSafeDistanceBetweenUserandExhibit(userPosition, position, item, roomSpatialAudio){
    const safeDistance = 0.8;
    if (userPosition.distanceTo(position) < safeDistance) {
        toggleWarning(item, true);
        roomSpatialAudio.startWarningSound(true);
    } else {
        toggleWarning(item, false);
        roomSpatialAudio.startWarningSound(false);
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
            isAlreadyTracked: item.isAlreadyTracked
        };
        imageTrackables.push(newItem);
    }
    return imageTrackables;
}

export async function createXRImageBitmap(url) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();

    // Generate bitmap and clean up the original image to free resources
    const bitmap = await createImageBitmap(img);
    img.remove();
    return bitmap;
}

export function PlaceObjectsOnTarget(frame, referenceSpace, trackedImages, userPosition, roomSpatialAudio) {
    
    if(trackedTargetData)
    {        
        trackedTargetData.forEach(item => {    
            FindSafeDistanceBetweenUserandExhibit(userPosition, item.position, item.name, roomSpatialAudio);
        });
    } 
    
    const pose = frame.getViewerPose(referenceSpace);

    if (!pose) {
        console.log("No viewer pose found.");
        return;
    }

    const results = frame.getImageTrackingResults();
    trackedImages.forEach(trackedImageIndex => {
        const result = results.find(r => r.index === trackedImageIndex.index);
        const imagePose = result && result.trackingState === 'tracked' ? frame.getPose(result.imageSpace, referenceSpace) : null;
        const isVisible = imagePose !== null;

        if (isVisible && !trackedImageIndex.isAlreadyTracked) {
            TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible);
            trackedImageIndex.isAlreadyTracked = true;

        }

        if (isVisible && imagePose) {
            const isIndexPresent = trackedTargetData.some(item => item.index === trackedImageIndex.index);
            
            if (!isIndexPresent) {
                trackedTargetData.push({
                    position: imagePose.transform.position,
                    index: trackedImageIndex.index,
                    name: trackedImageIndex.Name
                });
            }

        }

    });
}

function TrackedImageDataInUse(trackedImageIndex, imagePose, isVisible) {
    if (!trackedImageIndex.meshes || trackedImageIndex.meshes.length === 0) return;

    if (isVisible && imagePose) {
        const position = imagePose.transform.position;        
        trackedImageIndex.meshes.forEach(meshData => {
            meshData.mesh.position.set(
                position.x + meshData.position.x,
                position.y + meshData.position.y,
                position.z + meshData.position.z
            );
            meshData.mesh.visible = true;
        });
    } else {
        trackedImageIndex.meshes.forEach(meshData => {
            meshData.mesh.visible = false;
        });
    }
}

export function IsCameraFacing(camera, target_Object, location) {
    const cameraDirection = camera.getWorldDirection(location);
    const directionToMesh = target_Object.position.clone().sub(camera.position).normalize();
    return cameraDirection.dot(directionToMesh) > 0.9;
}

export function toggleWarning(objectName, visibility) {
    const warningDiv = document.getElementById("Warrning");
    if (!warningDiv) return;

    const warningText = warningDiv.querySelector("h2");
    if (warningText) {
        warningText.textContent = `Please keep a safe distance from the ${objectName}. Thank you!`;
    }
    warningDiv.style.display = visibility ? "block" : "none";
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
