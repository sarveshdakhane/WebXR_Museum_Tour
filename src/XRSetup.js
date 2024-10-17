export async function createXRSession(trackedImages) {
    try {

        const requiredFeatures = ['dom-overlay', 'image-tracking'].filter(feature => {
            return feature === 'dom-overlay' || feature === 'image-tracking';
        });

        const xrTrackedImages = trackedImages.map(item => ({
            image: item.imageBitmap,
            widthInMeters: item.imageWidth, 

        }));

        const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures,
            trackedImages: xrTrackedImages,
            domOverlay: { root: document.body }
        });

        console.log("XR Session created.");

        return {
            session,
            imageTracking: requiredFeatures.includes('image-tracking'),
            domOverlay: requiredFeatures.includes('dom-overlay')
        };

    } catch (error) {
        console.error("Failed to create XR session:", error);
        return {
            session: null,
            imageTracking: false,
            domOverlay: false
        };
    }
}

export async function setupReferenceSpace(session) {
    try {
        const referenceSpace = await session.requestReferenceSpace('local');
        console.log("Reference space set up.");
        return referenceSpace;
    } catch (error) {
        console.error("Failed to set up reference space:", error);
        throw error;
    }
}
