import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();

// CimonParo Art Meshes
const GuideCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/GuideCimonandParo.glb', 
  'GuideCimonandParo', 
  { x: 0.0, y: 0.0, z: 0.0 },// position
  { x: 0.4, y: 0.4, z: 0.4 },// scale
  { x: 0, y: 0.4, z: 0 }  // rotation
);


const BookCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/BookCimonandParo.glb', 
  'BookCimonandParo', 
  { x: 0.0, y: 0.0, z: 0.0 },// position
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
       { position: { x: -0.6, y: -0.6, z: 0.0}, mesh: GuideCimonandParo.model, clickable : true , Animation:GuideCimonandParo.mixer, audioFile: "Audio/GuideCimonParoAudio.mp3" },
       { position: { x: 0.2, y: -0.5, z: 0.2}, mesh: BookCimonandParo.model }
    ],
    isAlreadyTracked: false
  }
  ,
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


const AudioSpeaker1 = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/speaker.glb', 
  'AudioSpeaker1', 
  { x: 0.5, y: 0, z: -0.9},// position
  { x: 0.001, y: 0.001, z: 0.001 },// scale
  { x: 0.0, y: 0.0, z: 0.0 }  // rotation
);


const AudioSpeaker2 = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/speaker.glb', 
  'AudioSpeaker2', 
  { x: 0.3, y: 0, z: -1.8},// position
  { x: 0.001, y: 0.001, z: 0.001 },// scale
  { x: 0.0, y: 0.0, z: 0.0 }  // rotation
);



SpatialAudioObjects = [
      { id: "obsracle", mesh: AudioSpeaker2.model, audioFile: "Audio/GuideCimonParoAudio.mp3"},
      { id: "sculpture", mesh: AudioSpeaker2.model , audioFile: "Audio/Mining.mp3"}
];

export{ targetImagesData , SpatialAudioObjects };
