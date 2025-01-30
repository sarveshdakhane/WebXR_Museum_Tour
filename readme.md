<p align="center">
    <img src="/public/Images/User Study.jpg" align="center" width="60%">
</p>

<h1 align="center"><code>❞ WebXR Museum Tour</code></h1>

<p align="center">
    <!-- Local repository, no metadata badges. -->
</p>

<p align="center"><b>Built with the following tools and technologies:</b></p>

<p align="center">
    <img src="https://img.shields.io/badge/WebXR-000000.svg?style=default&logo=WebXR&logoColor=white" alt="WebXR">
    <img src="https://img.shields.io/badge/Three.js-000000.svg?style=default&logo=Three.js&logoColor=white" alt="Three.js">
    <img src="https://img.shields.io/badge/npm-CB3837.svg?style=default&logo=npm&logoColor=white" alt="npm">
    <img src="https://img.shields.io/badge/HTML5-E34F26.svg?style=default&logo=HTML5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=default&logo=JavaScript&logoColor=black" alt="JavaScript">
    <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=default&logo=TypeScript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/PowerShell-5391FE.svg?style=default&logo=PowerShell&logoColor=white" alt="PowerShell">
    <img src="https://img.shields.io/badge/Vite-646CFF.svg?style=default&logo=Vite&logoColor=white" alt="Vite">
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Code Documentation](#-code-documentation)        
- [Getting Started](#-getting-started)
- [License](#-license)

---

## 🎨 Overview

The **WebXR Museum Tour** is an interactive, web-based augmented reality (AR) application designed to enhance museum experiences using **sonification and virtual cues**. The project integrates **spatial audio and 3D visual overlays** to improve user interaction and social awareness in museum settings. Built using **WebXR and Three.js**, the application provides a seamless and immersive AR experience accessible directly via web browsers.

---

## 🚀 Features

### **1. Interactive AR Tour Guide**
- Augmented tour guide with **spatialized audio narration**.
- Context-aware sonification enhances the visitor's experience.
- Image tracking allows for positioning digital elements over museum exhibits.

### **2. Sonified 3D Objects**
- Each 3D object is mapped with **audio feedback**, allowing users to explore artifacts interactively.
- Supports **gesture-based interaction** to trigger sonified content.

### **3. Audio Soundscape**
- Context-aware **spatial soundscapes** based on exhibit themes.
- Dynamically adjusts based on visitor **position and movement**.

### **4. Social Distancing Visualization**
- **Virtual cues and sound alerts** notify visitors when they are too close to an exhibit.
- Helps maintain social awareness within shared museum spaces.

---

## 📂 Project Structure

```
/
├── dist
├── public
│   ├── Audio
│   ├── Images
├── src
│   ├── CSS
│   ├── data.js
│   ├── main.js
│   ├── MeshesClass.js
│   ├── SpatialAudio.js
│   ├── XRSetup.js
├── package.json
├── server.js
├── spatial-room.html
├── vite.config.js
```

---

## 🛠️ Getting Started

### Prerequisites
Ensure your environment meets the following requirements:

- **Browser Support:** Chrome (Android only, WebXR API required)
- **Programming Language:** JavaScript / TypeScript
- **Package Manager:** npm

### Installation

1. Clone the repository:
   ```sh
   ❯ git clone <repo-url>
   ```

2. Navigate to the project directory:
   ```sh
   ❯ cd webxr-museum-tour
   ```

3. Install dependencies:
   ```sh
   ❯ npm install
   ```

4. Start the development server:
   ```sh
   ❯ npm start
   ```

### Usage
- Open the web application in a **WebXR-compatible browser (Chrome on Android)**.
- Scan an exhibit using **image tracking**.
- Interact with **3D objects and sonified tour guides**.
- Experience **contextual soundscapes** based on exhibit themes.

---

## 📜 Code Documentation

### Code Structure & Flow
This project is a **WebXR-based museum experience** that integrates **AR image tracking, spatial audio, and interactive 3D objects** using **Three.js**.

#### **1. Core Modules & Their Purpose**

| File                 | Purpose |
|----------------------|---------|
| `index.js`          | Handles UI interactions like opening/closing the menu. |
| `main.js`           | Manages XR session, initializes Three.js scene, and handles object interactions. |
| `MeshesClass.js`    | Creates and loads 3D models (GLTF/OBJ), buttons, and obstacles. |
| `SpatialAudio.js`   | Manages spatialized audio sources based on user position. |
| `SpatialAudioRoom.js` | Handles spatial audio setup in a specific AR environment. |
| `sdata.js`          | Defines spatial audio objects and their configurations. |
| `Utility.js`        | Utility functions for object placement, camera tracking, and safety warnings. |
| `XRSetup.js`        | Manages WebXR session creation and reference space setup. |

#### **2. Code Flow Overview**

1. **Application Initialization**
   - User starts AR session → `onARButtonClick()` in `main.js`.
   - Checks WebXR support → `checkSupport()` in `Utility.js`.
   - Creates XR session → `createXRSession()` in `XRSetup.js`.
   - Sets up the scene → `setupScene()` in `main.js`.

2. **Scene Setup & Interaction Handling**
   - Loads **GLTF 3D models**.
   - Adds **spatial audio and position tracking**.
   - Detects touch interactions & plays animations.

3. **Stopping AR Session**
   - Stops all audio and resets objects.
   - Ends session and reloads the page.

#### **3. Key Functions & Their Usage**

- `setupScene()`: Initializes Three.js scene, lighting, and objects.
- `setupInteractableObjects(scene, targetImagesData)`: Adds objects to the scene.
- `createXRSession()`: Initializes WebXR session.
- `onObjectClick()`: Detects user interactions with 3D objects.
- `togglePositionBasedAudio(id, play)`: Starts/stops positional audio.

#### **4. Notes & Optimizations**
- **Optimized Object Management**: Objects are **added once** and **updated dynamically** instead of recreating them.
- **Memory Management**: Objects like **audio elements** are removed when they are no longer needed.
- **Event Listeners Cleanup**: Ensures proper resource management.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

