import { SceneMeshes } from './MeshesClass.js';


const Meshes = new SceneMeshes();
const Button = Meshes.createButton();
const MeshforCimonParo = await Meshes.loadAndConfigureModelGLTF( 'Statue/CimonandParoBook.glb' , 'CimonParo' );
const MeshforOccasio = await Meshes.loadAndConfigureModelGLTF( 'Statue/CimonandParoBook.glb' , 'Occasio' );

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
         { mesh: Button, audioFile: "ac.mp3" },
         { mesh: MeshforCimonParo, audioFile: "ad.mp3" }
      ]
    },
    {
      index: 1, 
      url: 'Images/Occasio.jpg',     
      imageWidth: 0.597, 
      imageHeight: 0.335,
      meshes: 
      [
        //{ mesh: Button, audioFile: "ac.mp3" },
       // { mesh: MeshforOccasio, audioFile: "ad.mp3" }
      ]
    }
]; 





export{ targetImagesData , generalMeshes };
