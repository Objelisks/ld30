define(function(require, exports) {

  // load model
  var colladaLoader = new THREE.ColladaLoader();
  colladaLoader.options.convertUpAxis = true;
  colladaLoader.options.upAxis = 'Y';

  var loadModel = function(name, callback) {
    //var modelFile = require('./models/' + name + '.dae');
    colladaLoader.load('./models/' + name + '.dae', function(collada) {
      callback(collada.scene);
    });
  }

  var models = {};
  var loadModels = function(callback) {
    // hacky straight up defining all the model names
    var modelNames = ['base', 'top', 'telescope', 'controlBox', 'meteor', 'meteorEffect', 'powerBox', 'knob', 'mainScreen', 'teleporter', 'teleporterRing'];
    var totalRequired = modelNames.length;
    var totalLoaded = 0;
    modelNames.forEach(function(name) {
      loadModel(name, function(modelScene) {
        //             scene      object      mesh
        models[name] = modelScene.children[0].children[0];
        totalLoaded += 1;
        if(totalLoaded >= totalRequired) {
          callback();
        }
      });
    });
  }

  var getModel = function(name) {
    if(models[name]) {
      return models[name].clone();
    }
    else {
      return null;
    }
  }

  exports.loadModels = loadModels;
  exports.getModel = getModel;
})