/**
 * Created by daniele on 08/06/16.
 */

// parameters to adjust the view
// NOTE: to get real scale use value aside current value
var sizeFactor  = 80;     // 1
var orbitFactor = 50;     // 1000000
var orbitDetail = 500;    // how many segment compound the orbit ellipse
var detailLevel = 50;     // sphere geometry detail
var speedFactor = 20000;  // divide real speed
/** Create a Planet object with the specified information
 * @param plData - JSON object that contains planet data
 * */
function Planet(plData) {
  // save planet object into a variable to simplify object management
  var planetObject = this;
  // set planet information
  planetObject.data = plData;

  // planet orbital variable
  planetObject.counter = 0;

  // create a group to gather all mesh in one object
  planetObject.group = new THREE.Group();
  planetObject.group.name = planetObject.data['name'];
  // shadow setting on the mesh group
  planetObject.group.castShadow = true;
  planetObject.group.receiveShadow = true;

  // CREATE PLANET & ORBIT
  planetObject.planet = createPlanetMesh();
  planetObject.orbit = createPlanetOrbit();
  planetObject.group.add(planetObject.planet);
  planetObject.group.add(planetObject.orbit.mesh);

  // other settings
  // planetObject.planet.position.copy(planetObject.orbit.getPointAt(counter));
  planetObject.planet.position.copy(planetObject.orbit.ellipse.getPointAt(planetObject.counter));
  planetObject.planet.rotation.x = -(Math.PI/2);
  // planetObject.planet.rotation.z = (planetObject.data['obliquityToOrbit'] * Math.PI/180);

  planetObject.group.rotation.x = Math.PI/2;
  planetObject.group.rotation.y = (planetObject.data['orbitalInclination'] * Math.PI/180);
  // set orbit rotation

  /* =============================== */
  /*        PRIVATE FUNCTIONS        */
  /* =============================== */

  // CREATE PLANET OBJECT
  function createPlanetMesh() {
    // planet shape
    var geomPlanet = new THREE.SphereGeometry(
        planetObject.data['diameter'] / (2 * sizeFactor), // sphere radius
        detailLevel, // sphere number horizontal segment
        detailLevel  // sphere number vertical segment
    );

    // planet material (apply its texture)
    var matPlanet = new THREE.MeshLambertMaterial(
      {
        map : new THREE.TextureLoader().load('textures/' + planetObject.data['name'] + ".jpg")
      }
    );

    geomPlanet.rotateZ(planetObject.data['obliquityToOrbit'] * Math.PI/180);
    // create planet mash composing planet geometry with its material
    // var planet = new THREE.Mesh(geomPlanet, matPlanet);

    return new THREE.Mesh(geomPlanet, matPlanet);
  }

  // CREATE PLANET ORBIT
  function createPlanetOrbit() {
    return new PlanetOrbit(
      planetObject.data['aphelion'] * orbitFactor,
      planetObject.data['perihelion'] * orbitFactor,
      planetObject.data['orbitalEccentricity']
    );
  }

  /* =============================== */
  /*         PUBLIC FUNCTIONS        */
  /* =============================== */
  /** Move planet along its orbit and rotate it along its axis
   * */
  planetObject.update = function () {
    // rotation
    planetObject.planet.rotation.y += (1 / planetObject.data['rotationPeriod']);
    // revolution
    var curve = planetObject.orbit.ellipse;

    if (planetObject.counter <= 1) {
      planetObject.planet.position.copy(curve.getPoint(planetObject.counter));

      planetObject.counter += (planetObject.data['orbitalVelocity'] / speedFactor);
    }
    else {
      planetObject.counter = 0;
    }
  };

  /** Get planet actual position in the 3D space
   *  //@return the planet position - a Vector3 object that represent planet position
   *  */
  planetObject.getPlanetPosition = function () {
    return planetObject.planet.position.copy(planetObject.orbit.ellipse.getPoint(planetObject.counter));
  };
}

/* ====================================== */
/*             PLANET ORBIT               */
/* ====================================== */
function PlanetOrbit(aphelion, perihelion, eccentricity) {
  // set orbit info and calculate the other needed to build the orbit ellipse
  this.majorAxis = aphelion + perihelion;
  this.foci = this.majorAxis / 2 - perihelion;
  // TODO: add the explanation on how you get thi formula
  this.minorAxis = 2 * (this.foci / eccentricity) * Math.sqrt(1 - Math.pow(eccentricity, 2));

  // calculate ellipse radius
  this.radiusX = this.majorAxis/2;
  this.radiusY = this.minorAxis/2;

  // create the ellipse curve (2d object)
  var curve = new THREE.EllipseCurve(
      0,  0,            // aX, aY
      (this.radiusX),   // xRadius
      (this.radiusY),   // yRadius
      0,  2 * Math.PI,  // aStartAngle, aEndAngle
      false,            // aClockwise
      0                 // aRotation
  );

  // create a 3D ellipse curve from points of a 2d ellipse curve
  this.ellipse = new THREE.CatmullRomCurve3(get3dPoints(curve.getPoints(orbitDetail)));
  // add a random color to the orbit
  var material = new THREE.LineBasicMaterial(
    {
      color : "rgb(" + Math.round( 80)      +
              ","    + Math.round( 80 ) +
              ","    + Math.round( 80) + ")"
    }
  );

  // create the orbit
  var geometry = new THREE.Geometry();
  var ellipsePoints = this.ellipse.getPoints(orbitDetail);

  for (var i = 0; i < ellipsePoints.length; i++) {
    geometry.vertices.push(ellipsePoints[i]);
  }

  this.mesh = new THREE.Line(geometry, material);
  this.mesh.name = 'orbit';

  // add shadow options
  this.mesh.castShadow = true;
  this.mesh.receiveShadow = true;

  /* =============================== */
  /*       PRIVATE FUNCTIONS         */
  /* =============================== */

  /** Convert a Vector2 array into a Vector3 array (convert points from 2D to 3D)
   *  @param points2D - an array of Vector2 (2D point in Three JS)
   * */
  function get3dPoints(points2D) {
    var points3D = [];

    for(var i = 0; i < points2D.length; i++ ) {
      points3D.push(new THREE.Vector3(points2D[i].x, points2D[i].y, 0.0));
    }

    return points3D;
  }
}