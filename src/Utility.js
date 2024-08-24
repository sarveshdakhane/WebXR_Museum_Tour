
export function calculateDistance(pos1, pos2) {
    return pos1.distanceTo(pos2);
}



export function FindDistance( userPosition, obstacle , camera )
{
    const safeDistance = 0.9;
    let color;

    if (obstacle && camera) {

        const distance = calculateDistance(userPosition, obstacle.position);

        // Update color based on distance
        if (distance < safeDistance) {
            color = 0xFF0000;
        } else {
            color = 0x00FF00;
        }
        obstacle.material.color.set(color);
    }
}

export async function createXRImageBitmap() {
    const url = 'https://raw.githubusercontent.com/stemkoski/AR.js-examples/master/images/earth-flat.jpg';
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

export function PlaceObjectOnTarget(frame, referenceSpace, trackedImages, cube) {
    const pose = frame.getViewerPose(referenceSpace);
    
    if (pose) {
        const results = frame.getImageTrackingResults(trackedImages);
        results.forEach((result) => {

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
    } else {
        console.log("No viewer pose found.");
    }
}
