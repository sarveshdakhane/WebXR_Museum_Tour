<p align="center">
    <img src="/public/Images/User Study.jpg" align="center" width="30%">
</p>
<p align="center"><h1 align="center"><code>❯ WebXR Museum Tour</code></h1></p>
<p align="center">
	<!-- local repository, no metadata badges. --></p>
<p align="center">Built with the tools and technologies:</p>
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
<br>

##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
- [ Getting Started](#-getting-started)
- [ License](#-license)

---

##  Overview

The **WebXR Museum Tour** is an interactive, web-based augmented reality (AR) application designed to enhance museum experiences using **sonification and virtual cues**. The project integrates **spatial audio and 3D visual overlays** to improve user interaction and social awareness in museum settings. Built using **WebXR and Three.js**, the application provides a seamless and immersive AR experience accessible directly via web browsers.

---

##  Features

The application includes the following key features:

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

##  Project Structure

```sh
└── /
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

##  Getting Started

###  Prerequisites

Before getting started, ensure your environment meets the following requirements:

- **Browser Support:** Chrome (Android only, WebXR API required)
- **Programming Language:** JavaScript / TypeScript
- **Package Manager:** npm

###  Installation

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

###  Usage

- Open the web application in a **WebXR-compatible browser (Chrome on Android)**.
- Scan an exhibit using **image tracking**.
- Interact with **3D objects and sonified tour guides**.
- Experience **contextual soundscapes** based on exhibit themes.

---

##  License

This project is licensed under the [MIT License](LICENSE).
