define(function(require, exports) {

  var models = require('models');
  var display = require('display');

  var left = new THREE.Vector3(0, 0, 1);

  var Knob = function(control) {
      THREE.Object3D.call(this);
      this.thing = models.getModel('knob');
      this.add(this.thing);

      this.rotateOnAxis(left, -0.35);
      this.min = 0;
      this.max = 1.0;
      this.control = control;

      this.isControl = true;
  }
  Knob.prototype = Object.create(THREE.Object3D.prototype);

  Knob.prototype.turn = function(delta) {
    this.control.value = THREE.Math.clamp(this.control.value + delta, 0.0, 1.0);
    this.thing.quaternion.setFromAxisAngle(this.thing.up, this.control.value * Math.PI);
  }

  exports.Knob = Knob;

  exports.buildTelescopeControls = function(timeUniform) {
    var controlBox = models.getModel('controlBox');
    controlBox.position.x = 5;
    controlBox.position.z = 0;
    controlBox.quaternion.setFromAxisAngle(controlBox.up, 0);

    var values = [
      { name: 'θ', value: 0.1 },
      { name: 'ω', value: 0.6 }
    ];

    var knobLeft = new Knob(values[0]);
    knobLeft.position.z = 0.25;
    knobLeft.position.y = 0.78;
    knobLeft.turn(0);
    controlBox.add(knobLeft);
    var knobRight = new Knob(values[1]);
    knobRight.position.z = -0.25;
    knobRight.position.y = 0.78;
    knobRight.turn(0);
    controlBox.add(knobRight);

    var consoleScreen = new display.Display(display.displayRenderers.telescope, values, timeUniform);
    controlBox.display = consoleScreen;
    controlBox.add(consoleScreen);
    controlBox.controls = values;
    return controlBox;
  }

  exports.buildPlanetTracker = function(timeUniform) {
    var controlBox = models.getModel('controlBox');
    controlBox.position.x = 1;
    controlBox.position.z = 4;
    controlBox.quaternion.setFromAxisAngle(controlBox.up, Math.PI/2);

    var values = [
      { name: 'θ', value: 0.1 },
      { name: 'ω', value: 0.6 },
      { name: 'target1', value: new THREE.Box2().setFromPoints([new THREE.Vector2(10, 10), new THREE.Vector2(20, 20)]) },
      { name: 'target2', value: new THREE.Box2().setFromPoints([new THREE.Vector2(50, 5), new THREE.Vector2(55, 35)]) },
    ];

    var knobLeft = new Knob(values[0]);
    knobLeft.position.z = 0.25;
    knobLeft.position.y = 0.78;
    knobLeft.turn(0);
    controlBox.add(knobLeft);
    var knobRight = new Knob(values[1]);
    knobRight.position.z = -0.25;
    knobRight.position.y = 0.78;
    knobRight.turn(0);
    controlBox.add(knobRight);

    var consoleScreen = new display.Display(display.displayRenderers.planetTracker, values, timeUniform);
    controlBox.display = consoleScreen;
    controlBox.add(consoleScreen);
    controlBox.controls = values;
    return controlBox;
  }

  exports.buildMainScreen = function(timeUniform) {
    var monitor = models.getModel('mainScreen');
    monitor.position.x = -6.5;
    monitor.position.y = 4;

    var consoleScreen = new display.Display(display.displayRenderers.mainScreen, undefined, timeUniform, 4, 2);
    consoleScreen.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/12);
    consoleScreen.position.x = 0.2;
    consoleScreen.position.y = -1;
    monitor.display = consoleScreen;
    monitor.add(consoleScreen);

    return monitor;
  }
});