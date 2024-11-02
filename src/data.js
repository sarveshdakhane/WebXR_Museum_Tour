import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();

// CimonParo Art Meshes
const GuideCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/GuideCimonandParo.glb', 
  'GuideCimonandParo', 
  { x: -0.5, y: -0.4, z: -0.2},// position
  { x: 0.4, y: 0.4, z: 0.4 },// scale
  { x: 0, y: 0.4, z: 0 }  // rotation
);


const BookCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/BookCimonandParo.glb', 
  'BookCimonandParo', 
  { x: 0.0, y: -0.5, z: -0.2 },// position
  { x: 0.9, y: 0.9, z: 0.9 },// scale
  { x: -6, y: 0, z: 0 }  // rotation
);


// Other Art Meshes
const BttnOccasio = Meshes.createButton("BttnOccasio");




const targetImagesData = [
  { 
    index: 0, 
    Name: "CimonParo",
    url: 'Images/CimonParo.jpg',     
    imageWidth: 0.597, 
    imageHeight: 0.335,
    meshes: 
    [
       { position: GuideCimonandParo.position, mesh: GuideCimonandParo.model, clickable : true , Animation:GuideCimonandParo.mixer, audioFile: "Audio/GuideCimonParoAudio.mp3" },
       { position: BookCimonandParo.position, mesh: BookCimonandParo.model }
    ],
    isAlreadyTracked: false
  },
  {
    index: 1, 
    Name: "ABC",
    url: 'Images/Occasio.jpg',     
    imageWidth: 0.597, 
    imageHeight: 0.335,
    meshes: 
    [
      { mesh: BttnOccasio, audioFile: "ac.mp3" }
     // { mesh: MeshforOccasio.model, Animatio:MeshforOccasio.mixer , audioFile: "ad.mp3"}
    ],
    isAlreadyTracked: false
  }
]; 


/*   -------------------Spatial Audio Objects----------------------- */


let SpatialAudioObjects;


SpatialAudioObjects = [
      { id: "obsracle", mesh: Meshes.createObstacle(), audioFile: "Audio/A.mp3" },
      //{ id: "sculpture", mesh: await Meshes.loadAndConfigureModelGLTF( 'Statue/CimonandParoBook.glb', "sculpture" ) , audioFile: "Audio/A2.mp3" }
];









export{ targetImagesData , SpatialAudioObjects };
