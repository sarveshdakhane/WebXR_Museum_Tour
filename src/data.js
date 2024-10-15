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
      url: 'Images/p.png',     
      imageWidth: 0.297, 
      imageHeight: 0.210 , 
      widthInMeters : 0.297,
      meshes: 
      [
        { mesh: cube1, audioFile: "ac.mp3" },
        { mesh: cube2, audioFile: "ad.mp3" },
        { mesh: cube3, audioFile: "add.mp3" }
      ]
    }

]; 


export{ targetImagesData , generalMeshes };
