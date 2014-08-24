define(function(require, exports) {

  var display = require('display');
  var models = require('models');
  var controls = require('controls');

  // basic three setup
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.y = 1.0;
  var controller = new THREE.FirstPersonControls(camera, renderer.domElement);

  var pointer = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial());
  var helperPointer = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));

  var update, render, init;

  render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    var delta = clock.getDelta();
    update(delta);
  }



  var timeUniform = { type: 'f', value: 0.5 };
  var top, telescope, meteor;
  var displays = [];
  var telescopeControls, planetTracker, mainScreen, laserSampler, teleportControls;
  var hitObjects = [];

  init = function() {
    // mood lighting
    var light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
    scene.add(light);
    light = new THREE.AmbientLight(0x404050);
    scene.add(light);
    light = new THREE.DirectionalLight(0x405040);
    light.position.set(2, 1, 3);
    scene.add(light);

    // buildObservatory
    scene.add(models.getModel('base'));
    top = models.getModel('top');
    top.position.y = 5;
    scene.add(top);
    telescope = models.getModel('telescope');
    top.add(telescope);

    // build stations
    // telescope
    telescopeControls = controls.buildTelescopeControls(timeUniform);
    scene.add(telescopeControls);
    displays.push(telescopeControls.display);

    // planetTracker
    planetTracker = controls.buildPlanetTracker(timeUniform);
    scene.add(planetTracker);
    displays.push(planetTracker.display);

    // mainScreen turn on
    mainScreen = controls.buildMainScreen(timeUniform);
    scene.add(mainScreen);
    displays.push(mainScreen.display);

    // laser sampler

    // teleport controls



    // misc stuff
    // power station
    var powerBox = models.getModel('powerBox');
    powerBox.position.z = -7;
    powerBox.rotateOnAxis(powerBox.up, -Math.PI/2);
    scene.add(powerBox);

    // teleporter


    // meteor
    meteor = models.getModel('meteor');
    meteor.position.x = 180;
    meteor.position.y = 280;
    scene.add(meteor);

    meteorEffect = models.getModel('meteorEffect');
    meteorEffect.material.transparent = true;
    meteorEffect.material.opacity = 0.5;
    meteor.add(meteorEffect);

    // stars
    var starCount = 2000;
    var starGeometry = new THREE.CircleGeometry(1.5, 8);
    var starMaterial = new THREE.MeshBasicMaterial();
    starMaterial.shading = THREE.NoShading;
    for (var i = 0; i < starCount; i++) {
      var mesh = new THREE.Mesh(starGeometry, starMaterial);
      mesh.position.x = Math.random() * 2000 - 1000;
      mesh.position.y = Math.random() * 800 + 300;
      mesh.position.z = Math.random() * 2000 - 1000;
      mesh.lookAt(new THREE.Vector3());
      scene.add(mesh);
    }

    // register colliders
    scene.traverse(function(obj) {
      if(obj !== scene) {
        hitObjects.push(obj);
      }
    });

    // add non collision objects
    scene.add(pointer);
    scene.add(helperPointer);
  }


  var left = new THREE.Vector3(0, 0, 1);

  update = function(delta) {

    timeUniform.value += delta;

    displays.forEach(function(display) {
      display.render();
    });

    var targetTopAngle = new THREE.Quaternion().setFromAxisAngle(top.up, telescopeControls.controls[0].value * Math.PI * 2);
    top.quaternion.slerp(targetTopAngle, delta);

    var targetTelescopeAngle = new THREE.Quaternion().setFromAxisAngle(left, -telescopeControls.controls[1].value * Math.PI * 0.9 + Math.PI/2 - 0.125);
    telescope.quaternion.slerp(targetTelescopeAngle, delta);

    var oldPointerPosition = pointer.position.clone();
    var raycaster = new THREE.Raycaster(camera.position, new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), 0.1);
    var collisions = raycaster.intersectObjects(hitObjects, false);
    var selectedControl = null;
    var getControl = function(obj) {
      while(obj !== null && obj !== undefined) {
        if(obj.isControl) {
          return obj;
        }
        obj = obj.parent;
      }
      return null;
    }

    if(collisions[0]) {
      var collision = collisions[0];
      pointer.position.copy(collision.point);
      var control = getControl(collision.object);
      if(control !== null) {
        selectedControl = control;
      }
    }

    if(controller.mouseDragOn && selectedControl !== null) {
      var localPointer = selectedControl.thing.worldToLocal(pointer.position.clone());
      var localOldPointer = selectedControl.thing.worldToLocal(oldPointerPosition.clone());
      var controlPos = selectedControl.thing.position.clone();

      var newPosAngle = Math.atan2(localPointer.z - controlPos.z, localPointer.x - controlPos.x);
      var oldPosAngle = Math.atan2(localOldPointer.z - controlPos.z, localOldPointer.x - controlPos.x);
      var rotationDelta = (oldPosAngle - newPosAngle);
      rotationDelta = Math.atan2(Math.sin(rotationDelta), Math.cos(rotationDelta)) / 10.0;
      selectedControl.turn(rotationDelta);
    }

    var cameraOldPos = camera.position.clone();
    controller.update(delta);
    camera.position.y -= delta;
    camera.position.y = Math.max(camera.position.y, 1.0);

    var movement = camera.position.clone().sub(cameraOldPos);
    var raycaster
    // do collision raytrace
    // backup if needed
  }




  // start game
  models.loadModels(function() {
    init();
    render();
  });

});