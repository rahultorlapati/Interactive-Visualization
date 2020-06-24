
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var scene
// camera settings
  , camera
  , aspectRatio           // camera aspect ratio
  , fieldOfView = 90      // FOV height (in degrees)
  , nearPlane = 1         // minimum distance from camera to render the scene
  , farPlane = 100000000  // maximum distance from camera to render the scene
// render object
  , renderer
// orbit control object
  , controls
// statistic panel
  , stats
// solar system object
  ,solarSystem
  ;


var HEIGHT, WIDTH;

var STARTX = 80000, STARTY = 500000, STARTZ = 100000;


var UPDATE = false;

function init() {
 
  addStats();
  
  createScene();
 
  createLights();

  document.querySelector("#close-info").addEventListener("click", toggleInfoBox, false);
  document.querySelector("#close-keys").addEventListener("click", toggleKeyBindingBox, false);
  document.querySelector("#close-planet-panel").addEventListener("click", function () {
    document.querySelector("#planet-info").style.display = "none";
  }, false);
  document.querySelector("#close-keys").addEventListener("click", closeCenterBox, false);

  
  solarSystem = new SolarSystem();

  
  loop();
}


function addStats() {
  stats = new Stats();
  
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}


function createScene() {
  
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // create scene object
  scene = new THREE.Scene();

  // create camera
  aspectRatio = WIDTH / HEIGHT;
  camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
  );
  camera.position.x = STARTX;
  camera.position.y = STARTY;
  camera.position.z = STARTZ;
  // add the camera to scene, so we can observe it
  scene.add(camera);

  // create render object
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  // set background color
  renderer.setClearColor(0x0a0a12, 0.1);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  // add to the document the canvas on which will be rendered the scene
  document.querySelector("#solar-system").appendChild(renderer.domElement);

  // add orbit controls management
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.75;
  controls.minDistance = -5000;
  // controls.zoomSpeed = 2.0;

  // adjust scene size if screen size change
  window.addEventListener('resize', handleWindowResize, false);
  window.addEventListener('keydown', keyHandler, false);
}

/** Add Ambiental light */
function createLights() {
  var ambientLight = new THREE.AmbientLight(0x121212, 0.4); // soft white light
  scene.add(ambientLight);

  // Sun light is added when the Sun object is created
}

function loop() {
  // start to analyze project performance
  stats.begin();

  solarSystem.update();

  // update the scene
  renderer.render(scene, camera);

  // update orbit control camera
  controls.update();
  // end to analyze project performance
  stats.end();
  // tell to browser to render the canvas at 60 fps
  requestAnimationFrame(loop);
}

// when DOM window object is loaded, then call init function
window.addEventListener('load', init, false);

/* =================== */
/*  UTILITY FUNCTIONS  */
/* =================== */
/** Recompute screen size when it is called
 *  and update both renderer and camera settings
 * */
function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}
/**
 * Load a JSON file into a resource and pass it to callback function
 * @param JSONFile - The path of the file that contain JSON data
 * @param callback - A function to process loaded resource
 */
function loadJSON(JSONFile, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', JSONFile, true); // true => asynchronous mode
  xobj.onreadystatechange = function () {
    // if file is loaded in the correct way
    if (xobj.readyState == 4 && xobj.status == "200") {
      // function to call when the JSON is loaded
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

/** Handle all key down event selecting the right event handler */
function keyHandler(event) {
  // call the right event handler based on the pressed key
  // console.log(event.keyCode); // For DEBUG
  switch (event.keyCode) {
    case 32 : UPDATE = !UPDATE;       break; // 32 => space
    case 72 : toggleKeyBindingBox();  break; // 72 => H
    case 73 : toggleInfoBox();        break; // 73 => I
    case 82 : displayReset();         break; // 82 => R
  }
}

/** Reset the camera adn UI viewport */
function displayReset() {
  controls.reset();
  document.querySelector("#planet-info").style.display = "none";
  closeCenterBox();
}

function toggleInfoBox() {
 
  document.querySelector("#keybindings").style.display = "none";
 
  var infoBox = document.querySelector("#info");
  infoBox.style.display = infoBox.style.display === "block" ? "none" : "block";
}


function toggleKeyBindingBox() {
 
  document.querySelector("#info").style.display = "none";
  
  var keyBindingBox = document.querySelector("#keybindings");
  keyBindingBox.style.display = keyBindingBox.style.display === "block" ? "none" : "block";
}


function closeCenterBox() {
  document.querySelector("#info").style.display = "none";
  document.querySelector("#keybindings").style.display = "none";
}
