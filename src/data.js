import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();

// CimonParo
const GuideCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/GuideCimonandParo.glb', 
  'GuideCimonandParo', 
  { x: -0.3, y: -0.4, z: -0.2},// position
  { x: 0.2, y: 0.2, z: 0.2 },// scale
  { x: 0, y: 0.4, z: 0 }  // rotation
);

const BookCimonandParo = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/BookCimonandParo.glb', 
  'BookCimonandParo', 
  { x: 0.3, y: -0.3, z: -0.2 },// position
  { x: 0.6, y: 0.6, z: 0.6 },// scale
  { x: -6, y: 0, z: 0 }  // rotation
);


// Other Art Target

const BttnOccasio = Meshes.createButton("BttnOccasio");
const MeshforOccasio = await Meshes.loadAndConfigureModelGLTF( 
  'Statue/BookCimonandParo.glb', 
  'MeshforOccasio', 
  { x: 100, y: 100, z: 100 },// position
  { x: 0.4, y: 0.4, z: 0.4 },// scale
  { x: -6, y: 0, z: 0 }  // rotation
);


let generalMeshes;


generalMeshes = [
    //{ id: "obsracle", mesh: obstacle, audioFile: "Audio/A.mp3" },
    //{ id: "sculpture", mesh: await Meshes.loadAndConfigureModelGLTF( 'Statue/CimonandParoBook.glb', "sculpture" ) , audioFile: "Audio/A2.mp3" }
];


const targetImagesData = [
    { 
      index: 0, 
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
      url: 'Images/Occasio.jpg',     
      imageWidth: 0.597, 
      imageHeight: 0.335,
      meshes: 
      [
        { mesh: BttnOccasio, audioFile: "ac.mp3" },
        { mesh: MeshforOccasio.model, Animatio:MeshforOccasio.mixer , audioFile: "ad.mp3"}
      ]
    }
]; 

export{ targetImagesData , generalMeshes };
