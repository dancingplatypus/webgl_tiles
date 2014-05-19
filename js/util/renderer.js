provide([], function() {

  var Renderer = function (gl) {
    gl.clearColor(0.0, 0.0, 0.1, 1.0);
    gl.clearDepth(1.0);

    scene.velocity = scene.maxVelocity - 2 * scene.zoom;
  };

  Renderer.prototype.resize = function (gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    _.forEach(scene.tileMaps, function (map) {
      map.resizeViewport(canvas.width, canvas.height);
    });
  };


  Renderer.prototype.draw = function (gl, timing) {
    var state = controller.sample();

    scene.zoom += state.y2Axis / 20;
    scene.zoom = utils.clamp(scene.zoom, 0.5, scene.maxZoom);
    scene.maxVelocity = 5 * scene.zoom;

    scene.x += state.xAxis * scene.maxVelocity;
    scene.y += state.yAxis * scene.maxVelocity;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    _.forEach(scene.tileMaps, function (map) {
      map.setTileScale(scene.zoom);
      map.draw(scene.x, scene.y);
    })
  };

  return Renderer;
});