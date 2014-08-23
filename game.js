define(function(require, exports) {

  var getVertexShader = function(name) {
    return document.getElementById(name + '-vertexShader').textContent;
  }

  var getFragmentShader = function(name) {
    return document.getElementById(name + '-fragmentShader').textContent;
  }

  // basic three setup
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth * 0.90, window.innerHeight * 0.90);
  document.body.appendChild(renderer.domElement);

  var clock = new THREE.Clock(true);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.y = 1.0;
  var controller = new THREE.FirstPersonControls(camera, renderer.domElement);


  var update, render, start, init;

  start = function() {
    init();
    render();
  }

  render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    var delta = clock.getDelta();
    update(delta);
  }


  // load model
  var colladaLoader = new THREE.ColladaLoader();
  colladaLoader.options.convertUpAxis = true;
  colladaLoader.options.upAxis = 'Y';

  var loadModel = function(name, callback) {
    //var modelFile = require('./models/' + name + '.dae');
    colladaLoader.load('./models/' + name + '.dae', function(collada) {
      console.log('loaded mesh:', name);
      callback(collada.scene);
    });
  }

  var models = {};
  var loadModels = function(callback) {
    // hacky straight up defining all the model names
    var modelNames = ['base', 'top', 'telescope', 'controlBox', 'meteor', 'meteorEffect', 'powerBox'];
    var totalRequired = modelNames.length;
    var totalLoaded = 0;
    modelNames.forEach(function(name) {
      loadModel(name, function(modelScene) {
        //             scene      object      mesh
        models[name] = modelScene.children[0].children[0];
        totalLoaded += 1;
        if(totalLoaded >= totalRequired) {
          console.log('all loaded');
          callback();
        }
      });
    });
  }


  var displayUniforms = { 'time': { type: 'f', value: 0.5 } };
  var top, telescope, meteor;

  init = function() {
    var light = new THREE.HemisphereLight(0xffffff, 0x404040, 0.5);
    scene.add(light);
    light = new THREE.AmbientLight(0x404050);
    scene.add(light);
    light = new THREE.DirectionalLight(0x405040);
    light.position.set(2, 1, 3);
    scene.add(light);

    // buildObservatory
    scene.add(models['base']);
    top = models['top'];
    top.position.y = 5;
    scene.add(top);

    telescope = models['telescope'];
    top.add(telescope);


    var displayGeometry = new THREE.PlaneGeometry(1, 0.5);
    var displayMaterial = new THREE.ShaderMaterial({
      uniforms: displayUniforms,
      vertexShader: getVertexShader('display'),
      fragmentShader: getFragmentShader('display')
    });
    displayMaterial.side = THREE.DoubleSide;
    displayMaterial.transparent = true;
    var controlBoxNumber = Math.floor(Math.random() * 3) + 4;
    for (var i = 0; i < controlBoxNumber; i++) {
      var controlBox = models['controlBox'].clone();
      controlBox.position.x = Math.random() * 8 - 4;
      controlBox.position.z = Math.random() * 8 - 4;
      scene.add(controlBox);

      var material = displayMaterial;
      // set texture
      var display = new THREE.Mesh(displayGeometry, material);
      display.position.y = 1.2;
      display.position.x = -0.2;
      display.rotateOnAxis(display.up, Math.PI/2);
      controlBox.add(display);
    };

    var powerBox = models['powerBox'];
    powerBox.position.x = -7;
    scene.add(powerBox);

    meteor = models['meteor'];
    meteor.position.x = 180;
    meteor.position.y = 280;
    scene.add(meteor);

    meteorEffect = models['meteorEffect'];
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
  }


  var left = new THREE.Vector3(0, 0, 1);

  update = function(delta) {
    top.rotateOnAxis(top.up, -delta / 10);
    telescope.rotateOnAxis(left, delta / 20);
    camera.position.y -= delta;
    camera.position.y = Math.max(camera.position.y, 1.0);

    displayUniforms.time.value += delta;

    var cameraOldPos = camera.position.clone();
    controller.update(delta);
    // do collision raytrace
    // backup if needed
  }





  loadModels(start);

});