import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();
const BttnCimonParo = Meshes.createButton("BttnCimonParo");
const BttnOccasio = Meshes.createButton("BttnOccasio");
const MeshforCimonParo = await Meshes.loadAndConfigureModelGLTF( 'Statue/microwave.glb' , 'MeshCimonParo' );
const MeshforOccasio = await Meshes.loadAndConfigureModelGLTF( 'Statue/CimonandParoBook.glb' , 'MeshOccasio' );

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
         { mesh: BttnCimonParo, audioFile: "Audio/A2.mp3" },
         { mesh: MeshforCimonParo.model, Animatio:MeshforCimonParo.mixer, audioFile: "Audio/A.mp3" }
      ]
    },
    {
      index: 1, 
      url: 'Images/Occasio.jpg',     
      imageWidth: 0.597, 
      imageHeight: 0.335,
      meshes: 
      [
        { mesh: BttnOccasio, audioFile: "ac.mp3" },
        { mesh: MeshforOccasio.model, Animatio:MeshforCimonParo.mixer , audioFile: "ad.mp3"}
      ]
    }
]; 

export{ targetImagesData , generalMeshes };
