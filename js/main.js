import * as THREE from './libs/threejs/build/three.module.js';
import { OrbitControls } from './libs/threejs/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './libs/threejs/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from './libs/tween.esm.js';

var scene;
var frames = 0;
var objectsTween;
var vehicles;
var camera;
var renderer;

var config = {
  game: {
    velocity: 100,
    difficulty: 3,
    yspawn: 0,
    zspawn: 0,
    x_lane_0: -7.3,
    x_lane_1: -2.4,
    x_lane_2: 2.4,
    x_lane_3: 7.3,
    z_lane: -40,
  },
  colors: {
    sky: 'white',
  },
  utils: {
    showFog: true,
    isPlaying: false,
  }
  
}

//Declaring the car
var ferrari = {
  mesh: new THREE.Object3D(),
  positions :{
    left: -1,
    right: 1,
  },
  rotations :{
    right: Math.PI - degtorad(15),
    left: Math.PI + degtorad(15),
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

function degtorad(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

  var texture = texLoader.load("./assets/environment/road_texture.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 200, 1 );

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  road.mesh = new THREE.Mesh( geometry, material );
  road.mesh.position.set(0, config.game.yspawn - 0.5 , 0);
  road.mesh.rotation.set(0,Math.PI/2,0);
  road.mesh.scale.set(15000,1,20);
  road.mesh.receiveShadow = true;
  scene.add( road.mesh );
}

function spawnTruck(corsia){
  for (var j in vehicles.length){
    console.log("Sjocajnfowajmwf");
  }
  console.log("[++] : " + (((ferrari.mesh.position.z)) -80));
  var truck = new THREE.Object3D();
  truck.name = "Truck";
  let body = models.truck.gltf.clone();
  truck.add(body);
  truck.rotation.y = -Math.PI;
  if (corsia == 0) truck.position.set(config.game.x_lane_0, 0, -vehicles.position.z - 150);
  else if (corsia == 1) truck.position.set(config.game.x_lane_1,  0,-vehicles.position.z - 150);
  else if (corsia == 2) truck.position.set(config.game.x_lane_2, 0,   -vehicles.position.z - 150);
  else if (corsia == 3) truck.position.set(config.game.x_lane_3, 0,  -vehicles.position.z - 150);
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
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 250 );
  camera.position.set(0, 10, 100);
  camera.position.z = 30; //Set to 400 because the text was so big
  camera.lookAt(0, 0, 0);

  //Set up of the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color( config.colors.sky );

	// FOG
	if(config.utils.showFog) scene.fog = new THREE.Fog( config.colors.sky, 5, 200 );


  //Set up of the renderer
  renderer = new THREE.WebGLRenderer();
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

  directionalLight.shadow.camera.left = -10;
	directionalLight.shadow.camera.right = 10;
	directionalLight.shadow.camera.top = 140;
	directionalLight.shadow.camera.bottom = 0;
	directionalLight.shadow.camera.near = 30;
	directionalLight.shadow.camera.far = 5;
	directionalLight.shadow.bias = 0.0009;

  scene.add(directionalLight);


  initFerrari();
  initvehicles();
  initRoad();
  initListenerKeyboard();
    
  const animate = function() {
    requestAnimationFrame( animate );
    frames += 1;
    TWEEN.update();
    renderer.render( scene, camera );
  }
  animate();

}

function start(){
  spawnTruck(3);
  moveVehicles();
  moveFerrari();
}

// SETTING THE LISTENER FOR THE ANIMATIONS
var keyPressed = false;
function initListenerKeyboard(){
  document.onkeydown = function(e){
    keyPressed = true;
    switch(e.code){
      case 'KeyA':
      case 'ArrowLeft':
        moveLeft();
        performRotationTo(ferrari.rotations.left);
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveRight();
        performRotationTo(ferrari.rotations.right);
        break;
      case 'Enter':
        config.utils.isPlaying = !config.utils.isPlaying;
        if(config.utils.isPlaying) start();
        break;
    }
  }
  document.onkeyup = function(e){
    keyPressed = false;
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

function align(){
  if (config.utils.isPlaying){
    if ( ferrari.mesh.rotation.y != Math.PI){
      var rotation = { y: ferrari.mesh.rotation.y }; 
      var tween = new TWEEN.Tween(rotation)
        .to({ y: Math.PI }, config.game.velocity)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate( 
              () => {
                ferrari.mesh.rotation.y = rotation.y;
              }
        );
    
      tween.start();
      } 
  }
}

function performRotationTo( rad){
  if (config.utils.isPlaying){
    var rotation = { y: ferrari.mesh.rotation.y }; // Start at (0, 0)
    var tween = new TWEEN.Tween(rotation)
      .to({ y: rad }, config.game.velocity)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate( 
            () => {
              ferrari.mesh.rotation.y = rotation.y;
            }
      );

    tween.start();
  }
}

function performMovementTo( pos){
  if (config.utils.isPlaying){
    var delta = { x: 0 };
    if (pos < 0){
      objectsTween = new TWEEN.Tween(delta)
    .to({ x: -0.1 },config.game.velocity) 
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate( 
          () => {
            ferrari.mesh.position.x = ferrari.mesh.position.x + delta.x;
          }
    ).onComplete(() =>{
      if (!keyPressed) align();
    }).start();
    }else{
      objectsTween = new TWEEN.Tween(delta)
    .to({ x: 0.1 },config.game.velocity) 
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate( 
          () => {
            ferrari.mesh.position.x = ferrari.mesh.position.x + delta.x;
          }
    ).onComplete(() =>{
      if (!keyPressed) align();
    }).start();
    }
  }
}

var frame_ref = 0;
function moveFerrari(){
  console.log(frames);
	if (config.utils.isPlaying){
    var delta = { z: 0 };
    objectsTween = new TWEEN.Tween(delta)
    .to({ z: 0.3 },config.game.velocity) 
    .easing(TWEEN.Easing.Linear.None)
    .onUpdate( 
          () => {
            road.mesh.position.z = road.mesh.position.z + delta.z;
          }
    ).onComplete(
          () => {
            if (frames-frame_ref > 120){
              frame_ref = frames;
              console.log("UPDATE FRAME_REF:  " + frame_ref);
              spawnVehicles();
            }
            moveFerrari();
          }
    ).start();
  }
}

function moveVehicles(){
  
	if (config.utils.isPlaying){
    var delta = { z: 0 };
    objectsTween = new TWEEN.Tween(delta)
    .to({ z: 0.5 },config.game.velocity) 
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
}

function spawnVehicles(){
  var max = 3;
  var min = 0;
  let spawnAtPosition = [];
  for (let i = 0; i < 4; i ++) spawnAtPosition.push(false);
  for(var i = 0; i < 4; i++){
    var p = Math.random();
    if (config.game.difficulty == 1 && p > 0.8){
      spawnAtPosition[i] = true;
    }
    else if (config.game.difficulty == 2 && p > 0.6){
      spawnAtPosition[i] = true;
    }
    else if (config.game.difficulty == 3 && p > 0.2){
      spawnAtPosition[i] = true;
    }
  }
  if (!spawnAtPosition.includes(false)){
    console.log("PIENONE ZIOCANE");
    var p = getRandomInt(0,3);
    console.log("P: " + p);
    spawnAtPosition[p] = false;
  }
  for(let i = 0; i < spawnAtPosition.length; i ++){
    if (spawnAtPosition[i]) spawnTruck(i);
  }
}