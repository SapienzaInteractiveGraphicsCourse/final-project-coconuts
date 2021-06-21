import * as THREE from './libs/threejs/build/three.module.js';
import { OrbitControls } from './libs/threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './libs/threejs/examples/jsm/loaders/GLTFLoader.js';

var scene;

var config = {
  game: {
    yspawn: 0,
  }
}

//Declaring the car
var ferrari = {
  mesh: new THREE.Object3D()
}
var road = {
  mesh: new THREE.Object3D()
}

const models = {
  ferrari: {url: "./assets/cars/ferrari/scene.gltf"},
  road: {url: "./assets/environment/road/scene.gltf"},
}



function initFerrari(){
  ferrari.mesh = new THREE.Object3D();
  ferrari.mesh.name = "Ferrari";

  ferrari.mesh.position.set(0,config.game.yspawn,0);
  ferrari.mesh.rotation.set(0,Math.PI,0);
  let body = models.ferrari.gltf.getObjectByName('RootNode');
  ferrari.mesh.add(body);
  scene.add(ferrari.mesh);
}

function initRoad(){
  const texLoader = new THREE.TextureLoader();
  const geometry = new THREE.BoxGeometry(1,1,1);
  const material = new THREE.MeshBasicMaterial({
    map: texLoader.load("./assets/environment/road_texture.jpg"),
  });
  let cube = new THREE.Mesh( geometry, material );
  cube.position.set(0, config.game.yspawn - 0.5 , 0);
  cube.rotation.set(0,Math.PI/2,0);
  cube.scale.set(150,1,20);
  scene.add( cube );
}


var modelsLoaded = false;
loadModels();


function loadModels(){
  const modelsLoadMngr = new THREE.LoadingManager();
  modelsLoadMngr.onLoad = () => {
    modelsLoaded = true;
    if (modelsLoaded){
      init();
    }
  };
  modelsLoadMngr.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log("Loading the models... ", itemsLoaded/itemsTotal*100, "%");
  };
  {
		const gltfLoader = new GLTFLoader(modelsLoadMngr);
		for (const model of Object.values(models)) {
      console.log("Loading Model: ", model);
			gltfLoader.load(model.url, (gltf) => {

				gltf.scene.traverse( function ( child ) {

					if ( child.isMesh ) {
						if( child.castShadow !== undefined ) {
							child.castShadow = true;
							child.receiveShadow = true;
						}
					}
			
				} );

				model.gltf = gltf.scene;
				//console.log("******* GLTF Loaded *******\n", dumpObject(model.gltf).join('\n'));
				
			});
		}
	} 
}




function init(){
  //Set up of the camera
  console.log("sono in init");
  const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
  camera.position.set(0, 10, 100);
  camera.position.z = 30; //Set to 400 because the text was so big
  camera.lookAt(0, 0, 0);

  //Set up of the scene
  scene = new THREE.Scene();


  //Set up of the renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );


  //declaring control variable
  const controls = new OrbitControls(camera, renderer.domElement);
  
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  //const directionalLight = new THREE.DirectionalLight(0xffffff, 3, 100);
  //directionalLight.position.set(0,0,10);
  //scene.add(directionalLight);
  const hemisphereLight = new THREE.HemisphereLight(0xffffff,0.1, 10);
  hemisphereLight.position.set(0,0,10);
  scene.add(hemisphereLight);


  
  initFerrari();
  initRoad();

  const animate = function() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
  }
  animate();

}


