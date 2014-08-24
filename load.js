define(function(require, exports) {
  exports.vertexShader = function(name) {
    return document.getElementById(name + '-vertexShader').textContent;
  }

  exports.fragmentShader = function(name) {
    return document.getElementById(name + '-fragmentShader').textContent;
  }
});