import * as THREE from './libs/threejs/build/three.module.js';
import { OrbitControls } from './libs/threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './libs/threejs/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from './libs/tween.esm.js';

var scene;
var frames = 0;
var objectsTween;
var vehicles;

var config = {
  game: {
    yspawn: 0,
    zspawn: 0,
    x_lane_0: -7.3,
    x_lane_1: -2.4,
    x_lane_2: 2.4,
    x_lane_3: 7.3,
    z_lane: -40,
  }
}

//Declaring the car
var ferrari = {
  mesh: new THREE.Object3D(),
  positions :{
    left: -1,
    right: 1,
  }
}
var road = {
  mesh: new THREE.Object3D()
}

const models = {
  ferrari: {url: "./assets/cars/ferrari/scene.gltf"},
  road: {url: "./assets/environment/road/scene.gltf"},
  truck: {url: "./assets/cars/truck/scene.gltf"},
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
  cube.receiveShadow = true;
  scene.add( cube );
}

function spawnTruck(){
  var truck = new THREE.Object3D();
  truck.name = "Truck";
  let body = models.truck.gltf.clone();
  truck.add(body);
  truck.rotation.y = -Math.PI;
  truck.position.set(7.3, 0, -40);
  truck.scale.set(0.04,0.04,0.04);

  //scene.add(truck);
  vehicles.add(truck);
}

function initvehicles(){
  vehicles = new THREE.Group();
  scene.add(vehicles);
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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild( renderer.domElement );


  //declaring control variable
  const controls = new OrbitControls(camera, renderer.domElement);
  
  
  //Setting the Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3, 100);
  directionalLight.position.set(0, 10, config.game.zspawn + 3);
  var directionalLightTargetObject = new THREE.Object3D();
  directionalLightTargetObject.position.set(0, 0, config.game.zspawn + 4);

  scene.add(ambientLight);
  scene.add(directionalLightTargetObject);

  directionalLight.target = directionalLightTargetObject;
  directionalLight.castShadow = true;

  directionalLight.shadow.camera.left = -100;
	directionalLight.shadow.camera.right = 10;
	directionalLight.shadow.camera.top = 140;
	directionalLight.shadow.camera.bottom = 0;
	directionalLight.shadow.camera.near = 30;
	directionalLight.shadow.camera.far = 5;
	directionalLight.shadow.bias = 0.0009;

  scene.add(directionalLight);


  
  initFerrari();
  initRoad();
  initvehicles();
  spawnTruck();
  initListenerKeyboard();
  moveVehicles();
  const animate = function() {
    requestAnimationFrame( animate );
    frames += 1;
    TWEEN.update();
    renderer.render( scene, camera );
  }
  animate();

}

// SETTING THE LISTENER FOR THE ANIMATIONS

function initListenerKeyboard(){
  document.onkeydown = function(e){
    switch(e.code){
      case 'KeyA':
      case 'ArrowLeft':
        moveLeft();
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveRight();
    }
  }
}

function moveLeft(){
  if (ferrari.mesh.position.x < config.game.x_lane_0) return;
  performMovementTo(ferrari.positions.left);
}
function moveRight(){
  if (ferrari.mesh.position.x > config.game.x_lane_3) return;
  performMovementTo(ferrari.positions.right);
}

function performMovementTo( pos){
  var delta = { x: 0 };
	if (pos < 0){
    objectsTween = new TWEEN.Tween(delta)
	.to({ x: -0.1 },10) 
	.easing(TWEEN.Easing.Linear.None)
	.onUpdate( 
				() => {
					ferrari.mesh.position.x = ferrari.mesh.position.x + delta.x;
				}
	).onComplete(
				() => {
					moveVehicles();
				}
	).start();
  }else{
    objectsTween = new TWEEN.Tween(delta)
	.to({ x: 0.1 },10) 
	.easing(TWEEN.Easing.Linear.None)
	.onUpdate( 
				() => {
					ferrari.mesh.position.x = ferrari.mesh.position.x + delta.x;
				}
	).onComplete(
				() => {
					moveVehicles();
				}
	).start();
  }
}

function moveVehicles(){
  
	// init tween
	var delta = { z: 0 };
	objectsTween = new TWEEN.Tween(delta)
	.to({ z: 0.1 },1) 
	.easing(TWEEN.Easing.Linear.None)
	.onUpdate( 
				() => {
					vehicles.position.z = vehicles.position.z + delta.z;
				}
	).onComplete(
				() => {
					moveVehicles();
				}
	).start();
}