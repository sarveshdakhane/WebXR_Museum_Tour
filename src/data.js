import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();

// CimonParo Art Meshes
const GuideCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/GuideCimonandParo.glb', 
  'GuideCimonandParo', 
  { x: 1.2, y: 1.2, z: 1.2 },// scale
  { x: 0, y: 0.6, z: 0 }  // rotation
);


const BookCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/BookCimonandParo.glb', 
  'BookCimonandParo', 
  { x: 2, y: 2, z: 2 },// scale
  { x: -6, y: 0, z: 0 }  // rotation
);


// Other Art Meshes
const BttnOccasio = Meshes.createButton("BttnOccasio");



const targetImagesData = [
  { 
    index: 0, 
    Name: "GuideCimonandParo",
    url: 'Images/CimonParo.jpg',     
    imageWidth: 2.00, 
    imageHeight: 1.94,
    meshes: 
    [
       { position: { x: -1.5, y: -1.7, z: 0.1}, mesh: GuideCimonandParo.model, clickable : true , Animation:GuideCimonandParo.mixer, audioFile: "Audio/GuideCimonParoAudio.mp3"},
       { position: { x: 0.4, y: -1.1, z: -0.3}, mesh: BookCimonandParo.model }
    ],
    isAlreadyTracked: false
  }
]; 


export{ targetImagesData };
