export async function createXRSession(trackedImages) {
    try {

        const xrTrackedImages = trackedImages.map(item => ({
            image: item.imageBitmap,
            widthInMeters: item.widthInMeters
        }));
        
        const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['image-tracking', 'dom-overlay'],
            trackedImages: xrTrackedImages,
            domOverlay: { root: document.body }
        });
        console.log("XR Session created.");
        return session;
    } catch (error) {
        console.error("Failed to create XR session:", error);
        throw error;
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
