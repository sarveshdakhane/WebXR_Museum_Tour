import * as THREE from 'three';

export class RoomSpatialAudio {
    constructor(audioContext, audioRadius = 1.5, maxVolume = 0.6, minVolume = 0.01, onAudioEndCallback = null) {
        this.audioContext = audioContext;
        this.audioRadius = audioRadius;
        this.maxVolume = maxVolume;
        this.minVolume = minVolume;
        this.onAudioEndCallback = onAudioEndCallback;

        this.listener = this.audioContext.listener;
        this.positionBasedAudios = {};
        this.backgroundAudio = null;
        this.warningAudio = null;
    }
    async startWarningSound(start) {
        if (start) {
            this.pauseAllSounds();

            if (!this.warningAudio) {
                const warningAudioElement = new Audio('Audio/warning.mp3');
                warningAudioElement.loop = true;
                const track = this.audioContext.createMediaElementSource(warningAudioElement);
                const gainNode = this.audioContext.createGain();
                track.connect(gainNode).connect(this.audioContext.destination);

                this.warningAudio = { audioElement: warningAudioElement, gainNode };
            }

            if (this.warningAudio.audioElement.paused) {
                try {
                    await this.warningAudio.audioElement.play();
                } catch (error) {
                    console.error('Error playing warning audio:', error);
                }
            }
        } else {
            if (this.warningAudio && !this.warningAudio.audioElement.paused) {
                this.warningAudio.audioElement.pause();
                this.warningAudio.audioElement.currentTime = 0;
            }
            this.resumeAllSounds();
        }
    }

    pauseAllSounds() {
        Object.entries(this.positionBasedAudios).forEach(([id, audioObj]) => {
            if (!audioObj.audioElement.paused) {
                audioObj.audioElement.pause();
                audioObj.audioElement.currentTime = 0;
                audioObj.gainNode.disconnect();
                audioObj.panner.disconnect();
                audioObj.audioElement.remove();
            }

            delete this.positionBasedAudios[id];

            if (this.onAudioEndCallback) {
                this.onAudioEndCallback(id);
            }
        });

        if (this.backgroundAudio && !this.backgroundAudio.audioElement.paused) {
            this.backgroundAudio.audioElement.pause();
        }
    }

    resumeAllSounds() {
        if (this.backgroundAudio && this.backgroundAudio.audioElement.paused) {
            this.backgroundAudio.audioElement.play().catch(error => {
                console.error("Error resuming background audio:", error);
            });
        }
    }

    addPositionBasedAudio(id, audioSourcePath, sourcePosition) {
        if (this.positionBasedAudios[id]) {
            console.warn(`Audio with ID ${id} already exists.`);
            return;
        }

        const audioElement = new Audio(audioSourcePath);
        const track = this.audioContext.createMediaElementSource(audioElement);
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.positionX.setValueAtTime(sourcePosition.x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(sourcePosition.y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(sourcePosition.z, this.audioContext.currentTime);
        const gainNode = this.audioContext.createGain();
        track.connect(panner).connect(gainNode).connect(this.audioContext.destination);

        this.positionBasedAudios[id] = {
            audioElement,
            panner,
            gainNode,
            sourcePosition
        };
    }

    addBackgroundAudio(id, audioSourcePath) {
        if (this.backgroundAudio) {
            console.warn('Background audio is already added.');
            return;
        }

        const audioElement = new Audio(audioSourcePath);
        audioElement.loop = true;
        const track = this.audioContext.createMediaElementSource(audioElement);
        const gainNode = this.audioContext.createGain();
        track.connect(gainNode).connect(this.audioContext.destination);

        this.backgroundAudio = {
            id,
            audioElement,
            gainNode
        };
    }

    async togglePositionBasedAudio(id, shouldPlay) {
        const audioObj = this.positionBasedAudios[id];
    
        if (!audioObj) {
            console.warn(`Audio with ID ${id} not found.`);
            return;
        }
    
        if (shouldPlay) {
            // Resume AudioContext if needed
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this._playAudioElement(audioObj, id);
                });
            } else {
                this._playAudioElement(audioObj, id);
            }
        } else {
            // Delay pause and cleanup
            setTimeout(() => {
                if (!audioObj.audioElement.paused) {
                    audioObj.audioElement.pause();
                    audioObj.audioElement.currentTime = 0;
                }
    
                setTimeout(() => {
                    audioObj.gainNode.disconnect();
                    audioObj.panner.disconnect();
                    audioObj.audioElement.remove();
                    delete this.positionBasedAudios[id];
                    console.log(`Audio with ID ${id} has been stopped and removed.`);
                }, 100); // Delay cleanup slightly
            }, 100); // Delay pause slightly
        }
    }
    
    // Helper function to play audio and handle promise
    _playAudioElement(audioObj, id) {
        if (audioObj.audioElement.paused) {
            audioObj.audioElement.play().then(() => {
                console.log(`Audio with ID ${id} started playing.`);
                audioObj.audioElement.onended = () => {
                    if (this.onAudioEndCallback) {
                        this.onAudioEndCallback(id);
                    }
                };
            }).catch(error => {
                if (error.name === 'AbortError') {
                    console.warn(`Play request for audio ID ${id} was interrupted.`);
                } else {
                    console.error(`Playback failed for audio ID ${id}:`, error);
                }
            });
        }
    }
    

    toggleBackgroundAudio(shouldPlay) {
        if (!this.backgroundAudio) {
            console.warn('No background audio available');
            return;
        }

        if (shouldPlay) {
            if (this.backgroundAudio.audioElement.paused) {
                this.backgroundAudio.audioElement.play().catch(error => {
                    console.error('Error playing background audio:', error);
                });
            }
        } else {
            if (!this.backgroundAudio.audioElement.paused) {
                this.backgroundAudio.audioElement.pause();
                this.backgroundAudio.audioElement.currentTime = 0;
            }
        }
    }

    updateListenerPosition(camera, userPosition) {
        this.listener.positionX.setValueAtTime(userPosition.x, this.audioContext.currentTime);
        this.listener.positionY.setValueAtTime(userPosition.y, this.audioContext.currentTime);
        this.listener.positionZ.setValueAtTime(userPosition.z, this.audioContext.currentTime);

        this.updateListenerOrientation(camera);
        this.updateVolume();
    }

    updateListenerPositionSpatialRoom(camera, userPosition) {
        this.listener.positionX.setValueAtTime(userPosition.x, this.audioContext.currentTime);
        this.listener.positionY.setValueAtTime(userPosition.y, this.audioContext.currentTime);
        this.listener.positionZ.setValueAtTime(userPosition.z, this.audioContext.currentTime);

        this.updateListenerOrientation(camera);
        this.updateSpatialAudioVolume();
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
        Object.entries(this.positionBasedAudios).forEach(([id, audioObj]) => {
            const { sourcePosition, gainNode, audioElement } = audioObj;
            const distance = Math.sqrt(
                Math.pow(this.listener.positionX.value - sourcePosition.x, 2) +
                Math.pow(this.listener.positionY.value - sourcePosition.y, 2) +
                Math.pow(this.listener.positionZ.value - sourcePosition.z, 2)
            );

            let volume = (distance <= this.audioRadius && !audioElement.paused)
                ? this.maxVolume - ((this.maxVolume - this.minVolume) * Math.pow(distance / this.audioRadius, 2))
                : 0;

            if (volume === 0 && !audioElement.paused) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }

            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        });

        if (this.backgroundAudio) {
            this.backgroundAudio.gainNode.gain.setValueAtTime(
                this.maxVolume,
                this.audioContext.currentTime
            );
        }
    }


    updateSpatialAudioVolume() {
        let closestAudioId = null;
        let closestDistance = Infinity;
        const veryCloseThreshold = this.audioRadius * 0.3;

        Object.entries(this.positionBasedAudios).forEach(([id, audioObj]) => {
            const { sourcePosition, audioElement } = audioObj;
            audioElement.loop = true;
            const distance = Math.sqrt(
                Math.pow(this.listener.positionX.value - sourcePosition.x, 2) +
                Math.pow(this.listener.positionY.value - sourcePosition.y, 2) +
                Math.pow(this.listener.positionZ.value - sourcePosition.z, 2)
            );

            if (distance < this.audioRadius && distance < closestDistance) {
                closestDistance = distance;
                closestAudioId = id;
            }
        });

        const isVeryCloseToClosest = closestDistance <= veryCloseThreshold;

        Object.entries(this.positionBasedAudios).forEach(([id, audioObj]) => {
            const { sourcePosition, gainNode, audioElement } = audioObj;
            const distance = Math.sqrt(
                Math.pow(this.listener.positionX.value - sourcePosition.x, 2) +
                Math.pow(this.listener.positionY.value - sourcePosition.y, 2) +
                Math.pow(this.listener.positionZ.value - sourcePosition.z, 2)
            );

            if (distance <= this.audioRadius) {
                if (!audioObj.isPlaying) {
                    audioElement.currentTime = 0;
                    audioElement.play();
                    audioObj.isPlaying = true;
                }

                const normalizedDistance = distance / this.audioRadius;
                let volume = this.maxVolume - ((this.maxVolume - this.minVolume) * Math.pow(normalizedDistance, 2));

                if (id !== closestAudioId && isVeryCloseToClosest) {
                    volume *= 0.3;
                }

                // Ensure volume is within min and max bounds
                volume = Math.min(this.maxVolume, Math.max(this.minVolume, volume));

                gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

            } else {
                if (audioObj.isPlaying) {
                    audioElement.pause();
                    audioObj.isPlaying = false;
                }
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        });
    }
        
    closeAllAudio() {
        Object.values(this.positionBasedAudios).forEach(audioObj => {
            audioObj.audioElement.pause();
            audioObj.audioElement.currentTime = 0;
            audioObj.gainNode.disconnect();
            audioObj.panner.disconnect();
            audioObj.audioElement.remove();
        });
        this.positionBasedAudios = {};

        if (this.backgroundAudio) {
            this.backgroundAudio.audioElement.pause();
            this.backgroundAudio.audioElement.currentTime = 0;
            this.backgroundAudio.gainNode.disconnect();
            this.backgroundAudio.audioElement.remove();
            this.backgroundAudio = null;
        }

        if (this.audioContext.state !== 'closed') {
            this.audioContext.close().then(() => {
                console.log('AudioContext successfully closed.');
            }).catch((error) => {
                console.error('Error closing AudioContext:', error);
            });
        }
    }
}
