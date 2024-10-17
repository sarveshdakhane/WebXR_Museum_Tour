import * as THREE from 'three';

export class RoomSpatialAudio {
    constructor(audioContext, audioRadius = 1.5, maxVolume = 0.6, minVolume = 0.01) {
        this.audioContext = audioContext;
        this.audioRadius = audioRadius;
        this.maxVolume = maxVolume;
        this.minVolume = minVolume;

        // Initialize the listener
        this.listener = this.audioContext.listener;

        // Store position-based audio and background audio objects
        this.positionBasedAudios = {};
        this.backgroundAudio = null;
        this.backgroundGainNode = null;
    }

    // Function to add position-based audio (user provides a unique ID)
    addPositionBasedAudio(id, audioSourcePath, sourcePosition) {
        if (this.positionBasedAudios[id]) {
            console.warn(`Audio with ID ${id} already exists.`);
            return;
        }

        const audioElement = new Audio(audioSourcePath);
        audioElement.loop = true;

        // Create media element source
        const track = this.audioContext.createMediaElementSource(audioElement);

        // Create PannerNode for spatial audio
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF'; // Use HRTF for spatial audio
        panner.positionX.setValueAtTime(sourcePosition.x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(sourcePosition.y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(sourcePosition.z, this.audioContext.currentTime);

        // Create a GainNode to control volume
        const gainNode = this.audioContext.createGain();

        // Connect the nodes
        track.connect(panner).connect(gainNode).connect(this.audioContext.destination);

        // Store the position-based audio info
        this.positionBasedAudios[id] = {
            audioElement,
            panner,
            gainNode,
            sourcePosition
        };
    }

    // Function to add background spatial audio (user provides a unique ID)
    addBackgroundAudio(id, audioSourcePath) {
        if (this.backgroundAudio) {
            console.warn('Background audio is already added.');
            return;
        }

        const audioElement = new Audio(audioSourcePath);
        audioElement.loop = true;

        // Create media element source
        const track = this.audioContext.createMediaElementSource(audioElement);

        // Create a GainNode to control the background audio volume
        const gainNode = this.audioContext.createGain();

        // Connect the nodes (no panner, since it's background audio)
        track.connect(gainNode).connect(this.audioContext.destination);

        // Store background audio
        this.backgroundAudio = {
            id,
            audioElement,
            gainNode
        };
    }

    // Start or stop position-based audio by ID
    togglePositionBasedAudio(id, shouldPlay) {
        const audioObj = this.positionBasedAudios[id];
        if (!audioObj) {
            console.warn(`Audio with ID ${id} not found.`);
            return;
        }

        if (shouldPlay) {
            audioObj.audioElement.play();
        } else {
            audioObj.audioElement.pause();
            audioObj.audioElement.currentTime = 0; // Reset the audio playback position
        }
    }

    // Start or stop the background audio
    toggleBackgroundAudio(shouldPlay) {
        if (!this.backgroundAudio) {
            console.warn('No background audio available');
            return;
        }

        if (shouldPlay) {
            this.backgroundAudio.audioElement.play();
        } else {
            this.backgroundAudio.audioElement.pause();
            this.backgroundAudio.audioElement.currentTime = 0; // Reset the audio playback position
        }
    }

    // Update listener position in 3D space
    updateListenerPosition(camera, userPosition ) {
        this.listener.positionX.setValueAtTime(userPosition.x, this.audioContext.currentTime);
        this.listener.positionY.setValueAtTime(userPosition.y, this.audioContext.currentTime);
        this.listener.positionZ.setValueAtTime(userPosition.z, this.audioContext.currentTime);

        this.updateListenerOrientation(camera);
        this.updateVolume();
    }

    // Update listener orientation based on camera direction
    updateListenerOrientation(camera) {
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        this.listener.forwardX.setValueAtTime(cameraDirection.x, this.audioContext.currentTime);
        this.listener.forwardY.setValueAtTime(cameraDirection.y, this.audioContext.currentTime);
        this.listener.forwardZ.setValueAtTime(cameraDirection.z, this.audioContext.currentTime);

        const upVector = new THREE.Vector3(0, 1, 0);
        this.listener.upX.setValueAtTime(upVector.x, this.audioContext.currentTime);
        this.listener.upY.setValueAtTime(upVector.y, this.audioContext.currentTime);
        this.listener.upZ.setValueAtTime(upVector.z, this.audioContext.currentTime);
    }

    // Update volume of position-based audios and adjust background audio depending on listener's distance
    updateVolume() {
        let isUserNearAnyPositionAudio = false;

        Object.values(this.positionBasedAudios).forEach((audioObj) => {
            const { sourcePosition, gainNode } = audioObj;
            const distance = Math.sqrt(
                Math.pow(this.listener.positionX.value - sourcePosition.x, 2) +
                Math.pow(this.listener.positionY.value - sourcePosition.y, 2) +
                Math.pow(this.listener.positionZ.value - sourcePosition.z, 2)
            );

            let volume;
            if (distance <= this.audioRadius) {
                isUserNearAnyPositionAudio = true; // User is near a position-based audio
                const normalizedDistance = distance / this.audioRadius;
                volume = this.maxVolume - ((this.maxVolume - this.minVolume) * Math.pow(normalizedDistance, 2));
            } else {
                volume = 0; // Mute if outside the radius
                audioObj.audioElement.currentTime = 0; // Reset the audio playback position
            }

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        });

        // Adjust background audio volume based on whether the user is near any position-based audio
        if (this.backgroundAudio) {
            const backgroundVolume = isUserNearAnyPositionAudio ? 0 : 1; // Mute background if near, else play it
            this.backgroundAudio.gainNode.gain.setValueAtTime(backgroundVolume, this.audioContext.currentTime);
        }
    }

    // Update a specific position-based audio's position by ID
    updateSourcePosition(id, newPosition) {
        const audioObj = this.positionBasedAudios[id];
        if (!audioObj) {
            console.warn(`Audio with ID ${id} not found.`);
            return;
        }

        audioObj.sourcePosition = newPosition;
        audioObj.panner.positionX.setValueAtTime(newPosition.x, this.audioContext.currentTime);
        audioObj.panner.positionY.setValueAtTime(newPosition.y, this.audioContext.currentTime);
        audioObj.panner.positionZ.setValueAtTime(newPosition.z, this.audioContext.currentTime);
    }

    // Close all audios (both position-based and background)
    closeAllAudio() {
        // Pause and reset all position-based audios
        Object.values(this.positionBasedAudios).forEach(audioObj => {
            audioObj.audioElement.pause();
            audioObj.audioElement.currentTime = 0;
        });

        // Pause and reset background audio if it exists
        if (this.backgroundAudio) {
            this.backgroundAudio.audioElement.pause();
            this.backgroundAudio.audioElement.currentTime = 0;
        }

        // Close the AudioContext if it's not already closed
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
                console.log('AudioContext successfully closed.');
            }).catch((error) => {
                console.error('Error closing AudioContext:', error);
            });
        }
    }
}
