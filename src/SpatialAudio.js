import * as THREE from 'three';

export class RoomSpatialAudio {
    constructor(audioContext, audioSourcePath, sourcePosition = {x: 0, y: 0, z: 0}, audioRadius = 2.2, maxVolume = 0.6, minVolume = 0.01) {
        this.audioContext = audioContext;
        this.audioRadius = audioRadius;
        this.maxVolume = maxVolume;
        this.minVolume = minVolume;
        this.sourcePosition = sourcePosition;

        // Initialize the listener
        this.listener = this.audioContext.listener;

        // Create an audio element and configure it
        this.audioElement = new Audio(audioSourcePath);
        this.audioElement.loop = true;

        // Create a media element source
        this.track = this.audioContext.createMediaElementSource(this.audioElement);

        // Create a PannerNode for spatial audio
        this.panner = this.audioContext.createPanner();
        this.panner.panningModel = 'HRTF'; // Use HRTF for spatial audio
        this.panner.positionX.setValueAtTime(this.sourcePosition.x, this.audioContext.currentTime);
        this.panner.positionY.setValueAtTime(this.sourcePosition.y, this.audioContext.currentTime);
        this.panner.positionZ.setValueAtTime(this.sourcePosition.z, this.audioContext.currentTime);

        // Create a GainNode to control volume
        this.gainNode = this.audioContext.createGain();

        // Connect the nodes
        this.track.connect(this.panner).connect(this.gainNode).connect(this.audioContext.destination);

        // Start playing the audio
        this.audioElement.play();
    }

    updateListenerPosition(x, y, z, camera) {
        this.listener.positionX.setValueAtTime(x, this.audioContext.currentTime);
        this.listener.positionY.setValueAtTime(y, this.audioContext.currentTime);
        this.listener.positionZ.setValueAtTime(z, this.audioContext.currentTime);

        this.updateListenerOrientation(camera);
        this.updateVolume();
    }

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

    updateVolume() {
        const distance = Math.sqrt(
            Math.pow(this.listener.positionX.value - this.sourcePosition.x, 2) +
            Math.pow(this.listener.positionY.value - this.sourcePosition.y, 2) +
            Math.pow(this.listener.positionZ.value - this.sourcePosition.z, 2)
        );

        let volume;
        if (distance <= this.audioRadius) {
            const normalizedDistance = distance / this.audioRadius;
            volume = this.maxVolume - ((this.maxVolume - this.minVolume) * Math.pow(normalizedDistance, 2));
        } else {
            volume = 0; // Mute if outside the radius
        }

        this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
}
