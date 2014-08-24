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
      this.knobValue = control.value;

      this.isControl = true;
  }
  Knob.prototype = Object.create(THREE.Object3D.prototype);

  Knob.prototype.turn = function(delta) {
    this.knobValue = THREE.Math.clamp(this.knobValue + delta, 0.0, 1.0);
    this.control.value = Math.round(this.knobValue * 100.0) / 100.0;
    this.thing.quaternion.setFromAxisAngle(this.thing.up, this.knobValue * Math.PI);
  }

  exports.Knob = Knob;

  exports.buildTelescopeControls = function(timeUniform) {
    var controlBox = models.getModel('controlBox');
    controlBox.position.x = 5;
    controlBox.position.z = 0;
    controlBox.quaternion.setFromAxisAngle(controlBox.up, 0);

    var values = [
      { name: 'θ', value: 0.07 },
      { name: 'ω', value: 0.83 }
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
      { name: 'θ', value: 0.21 },
      { name: 'ω', value: 0.45 },
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

  exports.buildTeleporterControls = function(timeUniform) {
    var controlBox = models.getModel('controlBox');
    controlBox.position.x = -2;
    controlBox.position.z = -1.5;
    controlBox.quaternion.setFromAxisAngle(controlBox.up, -Math.PI/10);

    controlBox.redActive = true;
    controlBox.yellowActive = true;
    controlBox.blueActive = true;

    var values = [
      { name: 'r', value: 0.4 },
      { name: 'y', value: 0.5 },
      { name: 'b', value: 0.8 },
      { name: 'target1', value: 0.8 },
      { name: 'target2', value: 0.3 },
      { name: 'target3', value: 0.1 },
    ];

    var knobLeft = new Knob(values[0]);
    knobLeft.position.z = 0.30;
    knobLeft.position.y = 0.78;
    knobLeft.turn(0);
    controlBox.add(knobLeft);
    var knobMiddle = new Knob(values[1]);
    knobMiddle.position.z = 0;
    knobMiddle.position.y = 0.78;
    knobMiddle.turn(0);
    controlBox.add(knobMiddle);
    var knobRight = new Knob(values[2]);
    knobRight.position.z = -0.30;
    knobRight.position.y = 0.78;
    knobRight.turn(0);
    controlBox.add(knobRight);

    var consoleScreen = new display.Display(display.displayRenderers.teleporterControls, values, timeUniform);
    consoleScreen.controlBox = controlBox;
    controlBox.display = consoleScreen;
    controlBox.add(consoleScreen);
    controlBox.controls = values;
    return controlBox;
  }

  exports.buildTeleporter = function(timeUniform) {
    var teleporterBase = models.getModel('teleporter');
    teleporterBase.position.x = -4;

    var ring1 = models.getModel('teleporterRing');
    ring1.position.y = 0.5;
    var ring2 = models.getModel('teleporterRing');
    ring2.position.y = 1.0;
    var ring3 = models.getModel('teleporterRing');
    ring3.position.y = 1.5;

    teleporterBase.add(ring1);
    teleporterBase.add(ring2);
    teleporterBase.add(ring3);

    teleporterBase.ring1 = ring1;
    teleporterBase.ring2 = ring2;
    teleporterBase.ring3 = ring3;

    return teleporterBase;
  }
});