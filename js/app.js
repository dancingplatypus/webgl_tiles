require([
  'controller',
  'utils',
  "lodash",
  "tiles/tiles",
  "util/gl-context-helper",
  "util/gl-util",
  "util/game-shim",
  "glMatrix",
  "stats"
], function(controller, utils,  _, tiles, GLContextHelper, GLUtil) {
  "use strict";

  function get(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open('GET', url);

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.response);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };

      // Make the request
      req.send();
    });
  }

  var scene = {
    zoom: 1,
    maxZoom: 5,
    maxVelocity: 20,
    velocity: 0,
    x: 0,
    y: 0,
    tileMaps: []
  };

  function processMap(gl, assetDir, map) {
    console.log('processing map');

    var reFilename = /([^\\/]+)$/;

    return get(assetDir + '/' + map).then(function(mapFileJson) {
      var mapFile = JSON.parse(mapFileJson);
      console.log(mapFile);

      // TODO(mhays): Support multiple tilesets.
      _.forEach(mapFile.tilesets, function(tileset) {
        var filename = reFilename.exec(tileset.image)[0];
        var tileMap = new tiles.TileMap(gl);
        scene.tileMaps.push(tileMap);
        tileMap.setSpriteSheet(assetDir + '/' + filename);
        tileMap.tileSize = tileset.tilewidth;

        _.forEach(mapFile.layers, function(layer, idx) {
          if (idx != 2
              ) {
            return;
          }

          var canvas = document.createElement('CANVAS');
          canvas.height = layer.height;
          canvas.width = layer.width;

          var ctx = canvas.getContext('2d');
          var imgData = ctx.createImageData(layer.width, layer.height);
          console.log(layer.width, layer.height);
          for (var loop = 0; loop < layer.data.length; loop++) {
            // Because we only deal with one tileset, the id will start at
            // 1.  We need to subtract it to get an index into the tilemap.
            var tileIndex = layer.data[loop] - 1;

            // TODO(mhays): Support spacing.
            var tilesPerRow = tileset.imagewidth / tileset.tilewidth;

            imgData.data[loop*4] = tileIndex % tilesPerRow;
            imgData.data[loop*4 + 1] = Math.floor(tileIndex / tilesPerRow);
            imgData.data[loop*4 + 2] = 0;
            imgData.data[loop*4 + 3] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
          tileMap.setTileLayer(canvas.toDataURL(), idx, 1, 1);
        });
      });

      console.log('wrapping up');
    });
  }

  var Renderer = function (gl) {
    gl.clearColor(0.0, 0.0, 0.1, 1.0);
    gl.clearDepth(1.0);

    scene.velocity = scene.maxVelocity - 2 * scene.zoom;
  };

  Renderer.prototype.resize = function (gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    _.forEach(scene.tileMaps, function(map) {
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
    _.forEach(scene.tileMaps, function(map) {
      map.setTileScale(scene.zoom);
      map.draw(scene.x, scene.y);
    })
  };

  // Setup the canvas and GL context, initialize the scene
  var canvas = document.getElementById("webgl-canvas");
  var contextHelper = new GLContextHelper(canvas,
      document.getElementById("content-frame"));

  processMap(contextHelper.gl, 'assets', 'example.json').then(function() {
    var renderer = new Renderer(contextHelper.gl, canvas);
    contextHelper.start(renderer, stats);
  });

  var stats = new Stats();
  document.getElementById("controls-container").appendChild(stats.domElement);
});