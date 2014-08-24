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
      ctx.moveTo(lastPoint[0], lastPoint[1]);
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

    },

    'mainScreen' : function(ctx) {
      ctx.beginPath();
      ctx.fillStyle = 'green';
      ctx.moveTo(200, 200);
      ctx.arc(200, 200, 100, 0, 2 * Math.PI, false);
      ctx.lineTo(200, 200);
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font = '24pt sans-serif';
      ctx.fillText('planet: cmx4839-j', 400, 350);
      ctx.fillText('atmosphere: 15% c 20% n 13% o', 350, 100);
      ctx.fillText('composition: 15% c 20% n 13% o', 350, 150);
      ctx.fillText('temperature: 15% c 20% n 13% o', 350, 200);
    }
  };

})