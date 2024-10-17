import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();
const obstacle = Meshes.createObstacle();
const cube1 = Meshes.createCube();
const cube2 = Meshes.createCube();
const cube3 = Meshes.createCube();
let generalMeshes;


generalMeshes = [
    { id: "obsracle", mesh: obstacle, audioFile: "Audio/A.mp3" },
    { id: "sculpture", mesh: await Meshes.loadAndConfigureModel ( 'Statue/12338_Statue_v1_L3.obj' ) , audioFile: "Audio/A2.mp3" }
];

const targetImagesData = [
    { 
      index: 0, 
      url: 'Images/Painting.jpg',     
      imageWidth: 0.597, 
      imageHeight: 0.335,
      meshes: 
      [
        { mesh: cube1, audioFile: "ac.mp3" },
        { mesh: cube2, audioFile: "ad.mp3" },
        { mesh: cube3, audioFile: "add.mp3" }
      ]
    }

]; 


export{ targetImagesData , generalMeshes };
