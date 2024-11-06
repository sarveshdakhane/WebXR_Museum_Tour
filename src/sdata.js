import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();



/*   -------------------Spatial Audio Objects----------------------- */


let SpatialAudioObjects;

/*

const AudioSpeaker1 = await Meshes.SpaialloadAndConfigureModelGLTF( 
  'Statue/speaker.glb', 
  'AudioSpeaker1', 
  { x: 0.3, y: 0, z: -0.9},
  { x: 0.001, y: 0.001, z: 0.001 },// scale
  { x: 0.0, y: 0.0, z: 0.0 }  // rotation
);
*/

/*
const chariot_minier = await Meshes.SpaialloadAndConfigureModelGLTF( 
  'Statue/chariot_minier.glb', 
  'chariot_minier', 
  { x: 0.3, y: 0, z: -1.6},
  { x: 0.08, y: 0.08, z: 0.08 },// scale
  { x: 0.0, y: 0.0, z: 0.0 }  // rotation
);
*/

const mining = await Meshes.SpaialloadAndConfigureModelGLTF( 
  'Statue/abc.glb', 
  'mining', 
  { x: 0.0, y: 0, z: -2},
  { x: 0.01, y: 0.01, z: 0.01 },// scale
  { x: 0.0, y: 0.0, z: 0.0 }  // rotation
);


SpatialAudioObjects = [
      { id: "mining", mesh: mining.model, Animation: mining.mixer,audioFile: "Audio/Mining.mp3"}
];



export{ SpatialAudioObjects };
