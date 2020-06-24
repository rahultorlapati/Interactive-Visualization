
function SolarSystem() {
  // variable that represent this object
  var solarSystem = this;
  // array that will contain Solar System planets
  solarSystem.planets = [];
  solarSystem.sunSizeFactor = 400;
  solarSystem.sunRadius = 695700;
  solarSystem.sunRotationTime = 609.12;

  createSun();
  loadJSON("data/planets.json", planetsSetUp);

  function createSun() {
    // load Sun texture
    var sunTexture = new THREE.TextureLoader().load('textures/Sun.jpg');
    // create geometry and material
    var geomSun = new THREE.SphereGeometry(solarSystem.sunRadius / solarSystem.sunSizeFactor, 100, 100);
    var matSun = new THREE.MeshBasicMaterial({ map: sunTexture });
    // create Sun mesh
    solarSystem.sun = new THREE.Mesh(geomSun, matSun);
    // rotate Sun following its
    solarSystem.sun.rotateZ(7.25 * Math.PI/180);

    // Sun settings
    solarSystem.sun.mesh = "Sun";
    solarSystem.sun.castShadow = true;
    solarSystem.sun.receiveShadow = true;
    scene.add(solarSystem.sun);

    // add Sun light
    var sunLight = new THREE.PointLight(0xffffff, 1, 0);
    sunLight.power = 7 * Math.PI;
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
  }

  function planetsSetUp(response) {
    // parse JSON planets data and create a JS object
    var planetsData = JSON.parse(response);
    // now go through JS object and create planets with its information
    for (var i = 0; i < planetsData.length; i++) {
      solarSystem.planets.push(new Planet(planetsData[i]));
      // add each planet to scene
      scene.add(solarSystem.planets[i].group);
    }
  }

  /* =============================== */
  /*         PUBLIC FUNCTIONS        */
  /* =============================== */

  /** Update Solar System object information (position & rotation) */
  solarSystem.update = function () {
    // animate Solar System only if UPDATE is enabled
    if (UPDATE) {
      // rotate the Sun ()
      solarSystem.sun.rotation.y += (1 / solarSystem.sunRotationTime);

      // animate Planets
      for (var i = 0; i < solarSystem.planets.length; i++) {
        solarSystem.planets[i].update();
      }
    }
  };
  /** Return the n-th planet of Solar System
   *  @param number - the planet number [0 => Mercury - 8 => Pluto]
   *  @return the planet object
   * */
  solarSystem.getPlanetByNumber = function (number) {
    return solarSystem.planets[number];
  };
  /** Return the position in 3D space of the n-th planet of Solar System
   *  @param number - the planet number [0 => Mercury - 8 => Pluto]
   *  @return the planet position - a Vector3 object that represent planet position
   * */
  solarSystem.getPlanetPosition = function (number) {
    return solarSystem.planets[number].getPlanetPosition();
  }
}