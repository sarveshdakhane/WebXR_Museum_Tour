export async function createXRSession(trackedImages) {
    try {
        // Define the required features, excluding 'image-tracking' if trackedImages is null
        const requiredFeatures = ['dom-overlay'];
        
        // Only include 'image-tracking' if trackedImages is provided
        if (trackedImages) {
            requiredFeatures.push('image-tracking');
        }

        // Set up XR tracked images only if trackedImages is not null
        const xrTrackedImages = trackedImages
            ? trackedImages.map(item => ({
                image: item.imageBitmap,
                widthInMeters: item.imageWidth,
            }))
            : [];

        const sessionOptions = {
            requiredFeatures,
            domOverlay: { root: document.body }
        };

        // Add tracked images to the session options only if trackedImages is provided
        if (trackedImages) {
            sessionOptions.trackedImages = xrTrackedImages;
        }

        const session = await navigator.xr.requestSession('immersive-ar', sessionOptions);

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
