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
var collision =[];

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
    z_lane: 150,
    z_remove: 25,
  },
  colors: {
    sky: 'white',
  },
  utils: {
    showFog: true,
    isPlaying: false,
    hitbox_visible: false,
  }
  
}

//Declaring the car
var ferrari = {
  mesh: new THREE.Object3D(),
  positions :{
    left: -1,
    ahead: 0,
    right: 1,
    back: 2,
  },
  rotations :{
    right: Math.PI - degtorad(15),
    left: Math.PI + degtorad(15),
  }
}
var road = {
  mesh: new THREE.Object3D()
}

const hitBox = new THREE.BoxGeometry(1, 1, 1);
const hitBox_material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: .2,
});

const num_vehicles = 6; 
const models = {
  ferrari: {url: "./assets/cars/ferrari/scene.gltf"},
  road: {url: "./assets/environment/road/scene.gltf"},
  truck: {url: "./assets/cars/truck/scene.gltf"},
  fiat_500: {url: "./assets/cars/fiat_500/scene.gltf"},
  mercedes: {url: "./assets/cars/mercedes/scene.gltf"},
  bmw: {url: "./assets/cars/bmw/scene.gltf"},
}

//For Collisions
var ferrari_hitbox;
var hitbox_toCheck = [];

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

  ferrari_hitbox = new THREE.Mesh(hitBox, hitBox_material);
  ferrari_hitbox.name = "ferrari_hitbox";
  ferrari_hitbox.scale.set(2.5, 2, 7);
  ferrari_hitbox.position.set(0, 0, 0.3);
  ferrari_hitbox.visible = config.utils.hitbox_visible;

  ferrari.mesh.add(body);
  ferrari.mesh.add(ferrari_hitbox);
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

  var truck = new THREE.Object3D();
  truck.name = "Truck";
  let body = models.truck.gltf.clone();
  let hitbox_truck = createHitBox("truck");
  
  truck.add(body);
  truck.add(hitbox_truck);

  truck.rotation.y = -Math.PI;
  if (corsia == 0) truck.position.set(config.game.x_lane_0, 0, -vehicles.position.z - config.game.z_lane);
  else if (corsia == 1) truck.position.set(config.game.x_lane_1,  0,-vehicles.position.z - config.game.z_lane);
  else if (corsia == 2) truck.position.set(config.game.x_lane_2, 0,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 3) truck.position.set(config.game.x_lane_3, 0,  -vehicles.position.z - config.game.z_lane);
  truck.scale.set(0.04,0.04,0.04);
  

  vehicles.add(truck);
}

function spawn500(corsia){
  var fiat_500 = new THREE.Object3D();
  fiat_500.name = "Fiat_500";
  let body = models.fiat_500.gltf.clone();
  let hitbox_fiat_500 = createHitBox("fiat_500");
  
  fiat_500.add(body);
  fiat_500.add(hitbox_fiat_500);

  fiat_500.rotation.y = -Math.PI;
  if (corsia == 0) fiat_500.position.set(config.game.x_lane_0, 1.2,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 1) fiat_500.position.set(config.game.x_lane_1,  1.2,-vehicles.position.z - config.game.z_lane);
  else if (corsia == 2) fiat_500.position.set(config.game.x_lane_2, 1.2,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 3) fiat_500.position.set(config.game.x_lane_3, 1.2,  -vehicles.position.z - config.game.z_lane);
  fiat_500.scale.set(2.7,2.7,2.7);
  
  vehicles.add(fiat_500);
}

function spawnMercedes(corsia){
  var mercedes = new THREE.Object3D();
  mercedes.name = "mercedes";
  let body = models.mercedes.gltf.clone();
  let hitbox_mercedes = createHitBox("mercedes");
  
  mercedes.add(body);
  mercedes.add(hitbox_mercedes);

  mercedes.rotation.y = -Math.PI;
  if (corsia == 0) mercedes.position.set(config.game.x_lane_0, 0,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 1) mercedes.position.set(config.game.x_lane_1,  0,-vehicles.position.z - config.game.z_lane);
  else if (corsia == 2) mercedes.position.set(config.game.x_lane_2, 0,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 3) mercedes.position.set(config.game.x_lane_3, 0,  -vehicles.position.z - config.game.z_lane);
  mercedes.scale.set(0.016,0.016,0.016);
  
  vehicles.add(mercedes);

}

function spawnBmw(corsia){
  var bmw = new THREE.Object3D();
  bmw.name = "bmw";
  let body = models.bmw.gltf.clone();
  let hitbox_bmw = createHitBox("bmw");
  
  bmw.add(body);
  bmw.add(hitbox_bmw);

  if (corsia == 0) bmw.position.set(config.game.x_lane_0-1.5, 1.6,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 1) bmw.position.set(config.game.x_lane_1-1.5,  1.6,-vehicles.position.z - config.game.z_lane);
  else if (corsia == 2) bmw.position.set(config.game.x_lane_2-1.5, 1.6,   -vehicles.position.z - config.game.z_lane);
  else if (corsia == 3) bmw.position.set(config.game.x_lane_3-1.5, 1.6,  -vehicles.position.z - config.game.z_lane);
  bmw.scale.set(1.5, 1.5, 1.5);
  
  vehicles.add(bmw);

}

function provaspawnVec(){
  var truck = new THREE.Object3D();
  truck.name = "mercedes";
  let body = models.mercedes.gltf.clone();
  let hitbox_truck = createHitBox("bmw");
  
  truck.add(body);
  truck.add(hitbox_truck);


  truck.position.set(config.game.x_lane_2 - 1.5,0,   -vehicles.position.z - 5);
  truck.scale.set(0.016,0.016,0.016);
  

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
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 200 );
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


  document.getElementById("main_menu").hidden = false;

  initFerrari();
  initvehicles();
  initRoad();
  initListenerKeyboard();
  //provaspawnVec();
    
  const animate = function() {
    requestAnimationFrame( animate );
    frames += 1;
    TWEEN.update();
    renderer.render( scene, camera );
  }
  animate();

}

function start(){

  document.getElementById("main_menu").hidden = true;
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
      case 'KeyW':
        moveAhead();
        break;
      case 'KeyS':
        moveBack();
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

function moveAhead(){
  //if (ferrari.mesh.position.x > config.game.x_lane_3) return; Mettere controllo sulla Z
  performMovementTo(ferrari.positions.ahead);
}

function moveBack(){
  //if (ferrari.mesh.position.x > config.game.x_lane_3) return; Mettere controllo sulla Z
  performMovementTo(ferrari.positions.back);
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
    switch (pos) {
      case -1:
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
        break;
      case 1:
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
        break;
      case 0:
        objectsTween = new TWEEN.Tween(delta)
        .to({ x: 0.1 },config.game.velocity) 
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate( 
              () => {
                ferrari.mesh.position.z = ferrari.mesh.position.z - delta.x;
              }
        ).onComplete(() =>{
          if (!keyPressed) align();
        }).start();
        break;
      case 2:
        objectsTween = new TWEEN.Tween(delta)
        .to({ x: 0.1 },config.game.velocity) 
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate( 
              () => {
                ferrari.mesh.position.z = ferrari.mesh.position.z + delta.x;
              }
        ).onComplete(() =>{
          if (!keyPressed) align();
        }).start();
        break;
    }
  }
}

var frame_ref = 0;
function moveFerrari(){
  //console.log(frames);
  //console.log(ferrari_hitbox.geometry.attributes.position);
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
              spawnVehicles();
            }
            moveFerrari();
          }
    ).start();
  }
}

function removeSorpassedVehicles(){
  let carsToRemove = [];

  vehicles.traverse( function (child) {
    if ( child.isMesh){
      let object=child.parent;
      let objectPos = vehicles.position.z + object.position.z;
      if (objectPos > config.game.z_remove) carsToRemove.push(object);
    }
  });

  carsToRemove.forEach((object)=>{
    vehicles.remove(object);
  });
}

function calculateCollisionPoints( mesh, scale, type = 'collision' ) { 
  // Compute the bounding box after scale, translation, etc.
  var bbox = new THREE.Box3().setFromObject(mesh);
 
  var bounds = {
    type: type,
    xMin: bbox.min.x,
    xMax: bbox.max.x,
    yMin: bbox.min.y,
    yMax: bbox.max.y,
    zMin: bbox.min.z,
    zMax: bbox.max.z,
  };
  
  collisions.push( bounds );
}

function detectCollisions() {
  // Get the user's current collision area.
  var bounds = {
    xMin: rotationPoint.position.x - box.geometry.parameters.width / 2,
    xMax: rotationPoint.position.x + box.geometry.parameters.width / 2,
    yMin: rotationPoint.position.y - box.geometry.parameters.height / 2,
    yMax: rotationPoint.position.y + box.geometry.parameters.height / 2,
    zMin: rotationPoint.position.z - box.geometry.parameters.width / 2,
    zMax: rotationPoint.position.z + box.geometry.parameters.width / 2,
  };
  
  // Run through each object and detect if there is a collision.
  for ( var index = 0; index < collisions.length; index ++ ) {

    if (collisions[ index ].type == 'collision' ) {
      if ( ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) &&
         ( bounds.yMin <= collisions[ index ].yMax && bounds.yMax >= collisions[ index ].yMin) &&
         ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin) ) {
        // We hit a solid object! Stop all movements.
        stopMovement();

        // Move the object in the clear. Detect the best direction to move.
        if ( bounds.xMin <= collisions[ index ].xMax && bounds.xMax >= collisions[ index ].xMin ) {
          // Determine center then push out accordingly.
          var objectCenterX = ((collisions[ index ].xMax - collisions[ index ].xMin) / 2) + collisions[ index ].xMin;
          var playerCenterX = ((bounds.xMax - bounds.xMin) / 2) + bounds.xMin;
          var objectCenterZ = ((collisions[ index ].zMax - collisions[ index ].zMin) / 2) + collisions[ index ].zMin;
          var playerCenterZ = ((bounds.zMax - bounds.zMin) / 2) + bounds.zMin;

          // Determine the X axis push.
          if (objectCenterX > playerCenterX) {
            rotationPoint.position.x -= 1;
          } else {
            rotationPoint.position.x += 1;
          }
        }
        if ( bounds.zMin <= collisions[ index ].zMax && bounds.zMax >= collisions[ index ].zMin ) {
          // Determine the Z axis push.
          if (objectCenterZ > playerCenterZ) {
          rotationPoint.position.z -= 1;
          } else {
            rotationPoint.position.z += 1;
          }
        }
      }
    }
  }
}

function detectCollisionWrapper(){

  hitbox_toCheck = [];

  vehicles.traverse( function (child) {
    if (child.isMesh){
      let hitBox = child.getObjectByName("hitbox");
      if (hitBox) hitbox_toCheck.push(hitBox);
    }
  });

  hitbox_toCheck.forEach(detectCollision);
}

function detectCollision(hitbox){
  let verticesIndices = [1,3,4,6,-1];
  for (var i = 0; i < verticesIndices.length; i++){
    let origin = new THREE.Vector3();
    let direction = new THREE.Vector3(0,0, -1);

    
    if (verticesIndices[i] == -1){
      
      origin = ferrari.mesh.localToWorld(ferrari_hitbox.position.clone());
      origin.z +=1;
    }
    else{
      
      let vertexLocalPosition = new THREE.Vector3();
      var clonato = ferrari_hitbox.geometry.clone();
      vertexLocalPosition.multiplyVectors( (clonato.attributes.position.array[ verticesIndices[i] ]), ferrari_hitbox.scale );
      vertexLocalPosition.x += ferrari_hitbox.position.x;
			vertexLocalPosition.y += ferrari_hitbox.position.y;
			vertexLocalPosition.z += ferrari_hitbox.position.z;

      origin = ferrari.mesh.localToWorld(vertexLocalPosition);
    }

    let rcaster = new THREE.Raycaster(origin, direction.normalize());

    var hitResult = rcaster.intersectObject(hitbox);
		if(hitResult.length > 0) {
			hitMangaer(hitbox, hitResult[0].distance);
			break;
		}
  }
}

function hitMangaer(hitBox, hitDistance){
  let collision_object = hitBox.parent.name;
  
  switch (collision_object) {
    case 'Truck':
      if (hitDistance <= 4){
        console.log("Colpito " + collision_object);
        // OCCORRE FARE FUNZIONE CHE CONTROLLA SE CI SONO ANCORA VITE DISPONIBILI
        vehicles.remove(hitBox.parent);
      }
      break;
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
            removeSorpassedVehicles();
            detectCollisionWrapper();
          }
    ).onComplete(
          () => {
            moveVehicles();
          }
    ).start();
  }
}

function createHitBox(codice_veicolo){
  let hitbox = new THREE.Mesh(hitBox, hitBox_material);
  switch(codice_veicolo){
    case 'truck':
      hitbox.scale.set(83, 70, 205);
      hitbox.position.set(0,35, -6);
      hitbox.name = "hitbox"
      hitbox.visible = config.utils.hitbox_visible;
      return hitbox;
    case 'fiat_500':
      hitbox.scale.set(0.8, 0.7 ,1.85);
      hitbox.position.set(0,0,0);
      hitbox.name = "hitbox"
      hitbox.visible = config.utils.hitbox_visible;
      return hitbox;
    case 'mercedes':
      hitbox.scale.set(180, 100 ,450);
      hitbox.position.set(0,50, 0);
      hitbox.name = "hitbox"
      hitbox.visible = config.utils.hitbox_visible;
      return hitbox;
    case 'bmw':
      hitbox.scale.set(2.1, 1.5 ,5.2);
      hitbox.position.set(1.1,-0.5, 0.6);
      hitbox.name = "hitbox"
      hitbox.visible = config.utils.hitbox_visible;
      return hitbox;
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
    var p = getRandomInt(0,3);
    spawnAtPosition[p] = false;
  }
  for(let i = 0; i < spawnAtPosition.length; i ++){
    if (spawnAtPosition[i]) {
      //var cod = getRandomInt(1, num_vehicles);
      var cod =1;
      switch(cod){
        case 1:
          spawnTruck(i);
          break;
        case 2:
          spawn500(i);
          break;
        case 3:
          spawnMercedes(i);
          break;
        case 4:
          spawnBmw(i);
          break;
      }
    }
  }
}