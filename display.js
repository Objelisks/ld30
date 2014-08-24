define(function(require, exports) {

  var load = require('load');
  var simplex = new SimplexNoise(THREE.Math.random16);

  var displayMaterial = new THREE.ShaderMaterial({
    vertexShader: load.vertexShader('display'),
    fragmentShader: load.fragmentShader('display')
  });
  displayMaterial.side = THREE.DoubleSide;
  displayMaterial.transparent = true;

  var Display = function(displayRenderer, controls, timeUniform, width, height) {
      width = width || 1;
      height = height || 0.5;
      var geometry = new THREE.PlaneGeometry(width, height);
      var material = displayMaterial.clone();

      THREE.Mesh.call(this, geometry, material);

      this.position.y = 1.2;
      this.position.x = -0.2;
      this.rotateOnAxis(this.up, Math.PI/2);

      this.canvas = document.createElement('canvas');
      this.canvas.width = 200 * width;
      this.canvas.height = 200 * height;
      this.texture = new THREE.Texture(this.canvas);
      this.controls = controls;
      this.displayRenderer = displayRenderer;

      material.uniforms.time = timeUniform;
      material.uniforms.display = { type: 't', value: this.texture };
  }
  Display.prototype = Object.create(THREE.Mesh.prototype);

  Display.prototype.render = function() {
        var ctx = this.canvas.getContext('2d');
        //ctx.save();
        ctx.fillStyle = 'rgba(200, 200, 220, 0.5)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.displayRenderer.call(this, ctx);

        //ctx.restore();
        this.texture.needsUpdate = true;
      };

  exports.Display = Display;

  exports.displayRenderers = {
    'telescope' : function(ctx) {
      ctx.fillStyle = 'red';
      ctx.fillText('telescope controls', 2, 10);

      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.arc(30, 30, 15, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = 'red';
      ctx.moveTo(30, 30);
      ctx.arc(30, 30, 15, 0, 2 * Math.PI * this.controls[0].value, false);
      ctx.lineTo(30, 30);
      ctx.fill();
      ctx.fillText(this.controls[0].name + ' ' + this.controls[0].value.toFixed(2), 50, 40);

      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.moveTo(30, 70);
      ctx.arc(30, 70, 15, 0, Math.PI, true);
      ctx.lineTo(30, 70);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = 'red';
      ctx.moveTo(30, 70);
      ctx.arc(30, 70, 15, 0, -Math.PI * this.controls[1].value, true);
      ctx.lineTo(30, 70);
      ctx.fill();
      ctx.fillText(this.controls[1].name + ' ' + this.controls[1].value.toFixed(2), 50, 80);

      this.teleportControls.blueActive = this.planetTracker.controls[0].value === this.controls[0].value
                                      && this.planetTracker.controls[1].value === this.controls[1].value;
    },

    'planetTracker' : function(ctx) {
      ctx.fillStyle = 'red';
      ctx.fillText('star detector', 2, 10);
      
      // draw star field
      ctx.fillStyle = 'black';
      ctx.fillRect(25, 25, 50, 50);
      ctx.fillStyle = 'white';
      var s, t;
      for (s = 0; s < 50; s++) {
        for (t = 0; t < 50; t++) {
          if((simplex.noise2D(s, t)+1)/2.0 > 0.7) {
            ctx.fillRect(s + 25, t + 25, 1, 1);
          }
        }
      }

      // draw left box
      ctx.strokeStyle = 'red';
      ctx.strokeRect(25, 25, 50, 50);

      // draw target lines
      ctx.strokeStyle = 'blue';
      var x = (1.0 - this.controls[0].value) * 50;
      var y = this.controls[1].value * 50;
      ctx.beginPath();
      ctx.moveTo(x + 25, 20);
      ctx.lineTo(x + 25, 80);
      ctx.moveTo(20, y + 25);
      ctx.lineTo(80, y + 25);
      ctx.stroke();

      // draw spectra
      var g;
      var offsetx = 85;
      var offsety = 25;
      var lastPoint = 0;
      var coord = new THREE.Vector2();
      var target1Good = false, target2Good = false;
      ctx.strokeStyle = 'purple';
      ctx.beginPath();
      ctx.moveTo(offsetx, offsety + y);
      for(s = 0; s < 50; s++) {
        g = simplex.noise2D(s / 5.0, x+y) * 20;
        ctx.quadraticCurveTo(s*2 + offsetx - 1, lastPoint + offsety + y, s*2 + offsetx, g + offsety + y);
        lastPoint = g;

        if(this.controls[2].value.containsPoint(coord.set(s*2, g))) {
          target1Good = true;
        }
        if(this.controls[3].value.containsPoint(coord.set(s*2, g))) {
          target2Good = true;
        }
      }
      ctx.stroke();

      this.targetMet = target1Good && target2Good;

      // draw spectra targets
      var green = 'rgba(0,200,0,0.5)';
      var lightGreen = 'rgba(0,255,0,0.3)';
      var red = 'rgba(200,0,0,0.5)';
      var lightRed = 'rgba(255,0,0,0.3)';
      ctx.strokeStyle = target1Good ? green : red;
      ctx.fillStyle = target1Good ? lightGreen : lightRed;
      var box = this.controls[2].value;
      ctx.fillRect(box.min.x + offsetx, box.min.y + offsety + y, box.size().x, box.size().y);
      ctx.strokeRect(box.min.x + offsetx, box.min.y + offsety + y, box.size().x, box.size().y);

      ctx.strokeStyle = target2Good ? green : red;
      ctx.fillStyle = target2Good ? lightGreen : lightRed;
      box = this.controls[3].value;
      ctx.fillRect(box.min.x + offsetx, box.min.y + offsety + y, box.size().x, box.size().y);
      ctx.strokeRect(box.min.x + offsetx, box.min.y + offsety + y, box.size().x, box.size().y);

      // draw coordinates
      ctx.fillStyle = this.targetMet ? green : red;
      ctx.fillText(this.controls[1].name, 2, y + 25);
      ctx.fillText(this.controls[1].value.toFixed(2), 2, y + 35);
      ctx.fillText(this.controls[0].name + ' ' + this.controls[0].value.toFixed(2), x + 5, 95);

      this.teleportControls.yellowActive = this.targetMet;
    },

    'mainScreen' : function(ctx) {
      var a = this.telescopeControls.controls[0].value;
      var b = this.telescopeControls.controls[1].value;
      var color = (simplex.noise2D(a, b) + 1) / 2;
      var r = ((color * 432432) % 432) / 432;
      var g = ((color * 65432) % 876) / 876;
      var b = ((color * 14326) % 211) / 211;

      ctx.beginPath();
      ctx.fillStyle = 'rgb(' + Math.floor(r * 255.0) + ',' + Math.floor(g * 255.0) + ',' + Math.floor(b * 255.0) + ')';
      ctx.moveTo(200, 200);
      ctx.arc(200, 200, 100, 0, 2 * Math.PI, false);
      ctx.lineTo(200, 200);
      ctx.fill();

      var c, n, o;
      ctx.fillStyle = 'black';
      ctx.font = '24pt sans-serif';
      var name = '';
      for(c = 0; c < 8; c++) {
        name += String.fromCharCode(97 + Math.floor(((color * 5435 * (c+1)) % 432) / 432 * 26.0));
      }
      name += '-';
      for(c = 0; c < 3; c++) {
        name += Math.floor(((color * 5435 * (c+1)) % 432) / 432 * 10.0);
      }
      ctx.fillText('planet: ' + name, 400, 350);
      c = ((color * 54645) % 654) / 654 * 15.0;
      n = ((color * 87225) % 543) / 543 * 30.0;
      o = ((color * 983) % 123) / 123 * 10.0;
      ctx.fillText('atmosphere: '+c.toFixed(0)+'%c '+n.toFixed(0)+'%n '+o.toFixed(0)+'%o', 350, 100);
      c = ((color * 24698) % 666) / 666 * 50.0;
      n = ((color * 86453) % 567) / 567 * 30.0;
      o = ((color * 846354) % 778) / 778 * 5.0;
      ctx.fillText('composition: '+c.toFixed(0)+'%c '+n.toFixed(0)+'%n '+o.toFixed(0)+'%o', 350, 150);
      c = ((color * 21387) % 5637) / 5637 * 100 + 230;
      ctx.fillText('temperature: '+c.toFixed(1)+'K', 350, 200);
    },

    'teleporterControls' : function(ctx) {
      var time = this.material.uniforms.time.value;

      var s, g;
      var lastPoint = 0;
      var offsetx = 10;
      var offsety = 25;
      if(this.controlBox.redActive) {
        ctx.strokeStyle = 'purple';
        ctx.beginPath();
        ctx.moveTo(offsetx, offsety);
        for(s = 0; s < 50; s++) {
          var tick = s / 10.0 + time * 8.0;
          g = Math.sin(tick) * 10.0;
          ctx.quadraticCurveTo(s*3 + offsetx - 1, lastPoint + offsety, s*3 + offsetx, g + offsety);
        }
        ctx.stroke();
      }

      offsety = 45;
      if(this.controlBox.yellowActive) {
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(offsetx, offsety);
        for(s = 0; s < 50; s++) {
          var tick = s / 10.0 + time * 3.0;
          g = (2 * Math.floor(tick) - Math.floor(2 * tick) + 1) * 10.0;
          ctx.quadraticCurveTo(s*3 + offsetx - 1, lastPoint + offsety, s*3 + offsetx, g + offsety);
        }
        ctx.stroke();
      }

      offsety = 65;
      if(this.controlBox.blueActive) {
        ctx.strokeStyle = 'cyan';
        ctx.beginPath();
        ctx.moveTo(offsetx, offsety);
        for(s = 0; s < 50; s++) {
          var tick = s / 10.0 + time * 1.0;
          g = (2 * (tick - Math.floor(tick)) - 1) * 10.0;
          ctx.quadraticCurveTo(s*3 + offsetx - 1, lastPoint + offsety, s*3 + offsetx, g + offsety);
        }
        ctx.stroke();
      }



      offsety = 25;
      if(this.controlBox.redActive) {
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(offsetx, offsety);
        for(s = 0; s < 50; s++) {
          var tick = s / 10.0 + time * this.controls[0].value * 10.0;
          g = Math.sin(tick) * 10.0;
          ctx.quadraticCurveTo(s*3 + offsetx - 1, lastPoint + offsety, s*3 + offsetx, g + offsety);
        }
        ctx.stroke();
      }

      offsety = 45;
      if(this.controlBox.yellowActive) {
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(offsetx, offsety);
        for(s = 0; s < 50; s++) {
          var tick = s / 10.0 + time * this.controls[1].value * 10.0;
          g = (2 * Math.floor(tick) - Math.floor(2 * tick) + 1) * 10.0;
          ctx.quadraticCurveTo(s*3 + offsetx - 1, lastPoint + offsety, s*3 + offsetx, g + offsety);
        }
        ctx.stroke();
      }

      offsety = 65;
      if(this.controlBox.blueActive) {
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(offsetx, offsety);
        for(s = 0; s < 50; s++) {
          var tick = s / 10.0 + time * this.controls[2].value * 10.0;
          g = (2 * (tick - Math.floor(tick)) - 1) * 10.0;
          ctx.quadraticCurveTo(s*3 + offsetx - 1, lastPoint + offsety, s*3 + offsetx, g + offsety);
        }
        ctx.stroke();
      }
    }
  };

})