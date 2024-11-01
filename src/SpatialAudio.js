import * as THREE from 'three';

export class RoomSpatialAudio {
    constructor(audioContext, audioRadius = 1.5, maxVolume = 0.6, minVolume = 0.01, onAudioEndCallback = null) {
        this.audioContext = audioContext;
        this.audioRadius = audioRadius;
        this.maxVolume = maxVolume;
        this.minVolume = minVolume;
        this.onAudioEndCallback = onAudioEndCallback; 

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
            audioObj.audioElement.onended = () => {
                if (this.onAudioEndCallback) {
                    this.onAudioEndCallback(id);
                }
            };


        } else {
            // Pause and reset the audio playback position
            audioObj.audioElement.pause();
            audioObj.audioElement.currentTime = 0;
    
            // Disconnect and destroy audio nodes to free resources
            audioObj.gainNode.disconnect();
            audioObj.panner.disconnect();
            audioObj.audioElement.src = ''; // Remove audio source
    
            // Remove the audio object from positionBasedAudios
            delete this.positionBasedAudios[id];
            
            console.log(`Audio with ID ${id} has been stopped and removed.`);
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
        let isUserNearAnyActivePositionAudio = false;
        let closestDistance = Infinity; // Track the closest distance to any active position-based audio
    
        // Loop over each position-based audio, using Object.entries to get the id and audioObj
        Object.entries(this.positionBasedAudios).forEach(([id, audioObj]) => {
            const { sourcePosition, gainNode, audioElement } = audioObj;
            
            // Calculate distance between the listener and the audio source
            const distance = Math.sqrt(
                Math.pow(this.listener.positionX.value - sourcePosition.x, 2) +
                Math.pow(this.listener.positionY.value - sourcePosition.y, 2) +
                Math.pow(this.listener.positionZ.value - sourcePosition.z, 2)
            );
    
            let volume;
    
            // Check if within radius and the audio is actively playing
            if (distance <= this.audioRadius && !audioElement.paused) {
                isUserNearAnyActivePositionAudio = true;  // There’s an active audio within range
                closestDistance = Math.min(closestDistance, distance); // Update the closest distance
    
                // Calculate position-based audio volume with a fade-out effect
                const normalizedDistance = distance / this.audioRadius;
                volume = this.maxVolume - ((this.maxVolume - this.minVolume) * Math.pow(normalizedDistance, 2));
            } else {
                // If outside the radius, or not playing, mute the audio and reset it
                volume = 0;
                audioElement.currentTime = 0;
                audioElement.pause();
                if (this.onAudioEndCallback) {
                    this.onAudioEndCallback(id);  // Call the callback with the id
                }
            }
    
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        });
    
        // Adjust background audio volume based on the presence of active position-based audio within range
        if (this.backgroundAudio) {
            let backgroundVolume;
            const maxBackgroundVolume = 0.1; // Set the maximum background volume when near positioned audio
    
            if (isUserNearAnyActivePositionAudio) {
                const normalizedBackgroundVolume = 1 - (closestDistance / this.audioRadius);
                backgroundVolume = normalizedBackgroundVolume * maxBackgroundVolume * 0.3;
            } else {
                backgroundVolume = 1;
            }
    
            this.backgroundAudio.gainNode.gain.setValueAtTime(backgroundVolume, this.audioContext.currentTime);
        }
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
