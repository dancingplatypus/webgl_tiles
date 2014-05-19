require([
  'tiles/tiles', 'controller', 'lodash', 'stats',
  'utils', 'util/gl-context-helper', 'perlinSimplex', 'prng', 'util/gl-util'

], function(tiles, controller, _, Stats,
            utils, GLContextHelper, Perlin, prng) {

  var okToOffsetCheck = true;

  var data = {
    perlin: Perlin,
    sites: [],
    rng: prng,
    biomes: [],
    diagram: null,
    margin: 0.1,
    treemap: null,

    mapWidth: function() { return data.tileWidth * data.tilesX; },
    mapHeight: function() { return data.tileHeight * data.tilesY; },

    tilesX: 300,
    tilesY: 300,
    siteDensity: .01,

    perlinFrequency: 0.01,
    waterElevation: 0.4,
    octaves: 6,
    falloff: 0.5,

    spriteSheet: 'assets/textures.png',

    tileMap: null,
    contextHelper: null,
    tileWidth: 64,
    tileHeight: 64,

    minTilesVisibleX: 20,
    
    zoomChangeSpeed: 1/40,
    
    // This is the actual pixel width of the user's viewport.  It will
    // respond to screen size changes.
    viewportWidth: 50,
    viewportHeight: 50,
    
    perlinLandscape: null
  };

  var scene = {

    zoom: 0.2,
    maxVelocity: 20,
    velocity: 0,
    
    mapSwapThreshold: 1/8,

    viewportWidth: function() { return data.viewportWidth / scene.zoom; },
    viewportHeight: function() { return data.viewportHeight / scene.zoom; },

    // This is the offset of the user's top left corner into
    // the rendered viewport.  It is not zoomed.
    x: 0,
    y: 0,
    centerX: function() { return scene.x + scene.viewportWidth() / 2; },
    centerY: function() { return scene.y + scene.viewportHeight() / 2; },
    
    // Width and height of the map from the user's perspective (includes
    // zoom).
    mapWidth: function() { return data.mapWidth() / scene.zoom; },
    mapHeight: function() { return data.mapHeight() / scene.zoom; },
    
    // The min zoom is the zoom level at which the user's top left coordinate,
    // when set to (0,0), causes the midpoint of the viewable region to 
    // straddle the lower threshold which would trigger a page to be loaded
    // to the left or the top.
    minZoom: function() {
      return (data.viewportWidth / 2) / (scene.mapSwapThreshold * scene.mapWidth());
    },
    maxZoom: function() {
      return 2; //(data.viewportWidth) / (data.minTilesVisibleX * data.tileWidth);
    },
    
    // This is the index offset into the tilemap.
    landOffsetX: 0,
    landOffsetY: 0
    
  };

  var biomeList = {
    deepwater: [3,1],
    water: [1,0],
    water1: [1,0],
    sand: [1,1],
    swamp: [0,0],
    swamp1: [0,0],
    grass: [2,0],
    grass1: [2,0],
//    grass2: [2,0],
//    grass3: [2,0],
//    grass5: [2,0],
    tundra: [0,1],
    mountain: [3,0],
    snow: [2,1],
    snow1: [2,1],
    snow1: [2,1],
    snow2: [2,1],
    snow3: [2,1],
    snow4: [2,1]
  };

  var biomeSize = _.size(biomeList);
  var biomeKeys = _.keys(biomeList);
  var biome, idx, cellId;
  
  init();

  function init() {

    // This is the actual pixel width of the complete map fragment.

    setupPerlin();
    setupGl();
    setupTiles();
    data.perlinLandscape = setupPerlinTiles(0, 0);

    changeZoom(0.5);
    kickIt();
  }

  function setupPerlin() {
    data.perlin.noiseDetail(data.octaves, data.falloff);
    data.perlin.setRng(data.rng);
  }

  function setupGl() {
    // Setup the canvas and GL context, initialize the scene
    var canvas = document.getElementById("webgl-canvas");
    data.contextHelper = new GLContextHelper(canvas,
        document.getElementById("content-frame"));
  }

  function setupTiles() {
    data.tileMap = new tiles.TileMap(data.contextHelper.gl);
    data.tileMap.setSpriteSheet(data.spriteSheet);
    data.tileMap.tileSize = data.tileWidth;
  }

  function setupPerlinTiles(offX, offY, originX, originY, oldCanvas, done) {

    var canvas = document.createElement('CANVAS');
    canvas.height = data.tilesY;
    canvas.width = data.tilesX;
    var ctx = canvas.getContext('2d');
    var imgData;
    var x, y;

    if (oldCanvas) {
      ctx.drawImage(oldCanvas, originX - offX, originY - offY);
      imgData = ctx.getImageData(0, 0, data.tilesX, data.tilesY);
    } else {
      imgData = ctx.createImageData(data.tilesX, data.tilesY);
    }

    if (oldCanvas) {
      var newOffsetX = originX - offX;
      var newOffsetY = originY - offY;
      var leftBound = 0;
      var rightBound = data.tilesX;

      if (newOffsetX < 0) {
        leftBound = 0;
        rightBound = data.tilesX + newOffsetX;
        for (x = data.tilesX + newOffsetX; x < data.tilesX; x++) {
          for (y = 0; y < data.tilesY; y++) {
            processCell(imgData, x, y, offX, offY);
          }
        }
      } else if (newOffsetX > 0) {
        leftBound = newOffsetX;
        rightBound = data.tilesX;
        for (x = 0; x < newOffsetX; x++) {
          for (y = 0; y < data.tilesY; y++) {
            processCell(imgData, x, y, offX, offY);
          }
        }
      }
      if (newOffsetY < 0) {
        for (x = leftBound; x < rightBound; x++) {
          for (y = data.tilesY + newOffsetY; y < data.tilesY; y++) {
            processCell(imgData, x, y, offX, offY);
          }
        }
      } else if (newOffsetY > 0) {
        for (x = leftBound; x < rightBound; x++) {
          for (y = 0; y < newOffsetY; y++) {
            processCell(imgData, x, y, offX, offY);
          }
        }
      }
    } else {
      for (x = 0; x < data.tilesX; x++) {
        for (y = 0; y < data.tilesY; y++) {
          processCell(imgData, x, y, offX, offY);
        }
      }
    }
    
    ctx.putImageData(imgData, 0, 0);
    data.tileMap.updateTileLayer(canvas.toDataURL(), 0, 1, 1, done);

    return canvas;
  }

  function processCell(imgData, x, y, offX, offY) {
    cellId = data.perlin.noise(
            (x + offX) * data.perlinFrequency,
            (y + offY) * data.perlinFrequency);

    // Cut off area below
    if (cellId < data.waterElevation) {
      cellId = 0;
    } else {
      cellId = Math.floor(
              (biomeSize - 1) *
              (cellId - data.waterElevation) /
              (1.0 - data.waterElevation)) + 1;
    }

    idx = y * data.tilesX + x;

    biome = biomeKeys[cellId];

    imgData.data[idx * 4] = biomeList[biome][0];
    imgData.data[idx * 4 + 1] = biomeList[biome][1];
    imgData.data[idx * 4 + 2] = 0;

// greyscale.
//        imgData.data[idx * 4] = Math.floor(cellId * 255);
//        imgData.data[idx * 4 + 1] = Math.floor(cellId * 255);
//        imgData.data[idx * 4 + 2] = Math.floor(cellId * 255);
    imgData.data[idx * 4 + 3] = 255;
  }  
  
  
  var applyRunning = false;

  function apply(newOffsetX, newOffsetY, done) {
    if (applyRunning) {
      return;
    }
    applyRunning = true;
//    setTimeout(function() {
      data.perlinLandscape =
          setupPerlinTiles(
              scene.landOffsetX + newOffsetX,
              scene.landOffsetY + newOffsetY,
              scene.landOffsetX,
              scene.landOffsetY,
              data.perlinLandscape, done);
      scene.landOffsetX += newOffsetX;
      scene.landOffsetY += newOffsetY;
      applyRunning = false;
//    }, 0);
  }

  function changeZoom(newZoom) {
    newZoom = utils.clamp(newZoom, scene.minZoom(), scene.maxZoom());

    console.log('mapwidth', scene.mapWidth(), 'mw2', data.mapWidth(), 'zoom', newZoom, 'oldZ', scene.zoom,
    'x', scene.x, 'min', scene.minZoom(), 'max', scene.maxZoom());

    var oldViewportWidth = scene.viewportWidth();
    var oldViewportHeight = scene.viewportHeight();
    scene.zoom = newZoom;
    var newViewportWidth = scene.viewportWidth();
    var newViewportHeight = scene.viewportHeight();
    scene.x += (oldViewportWidth - newViewportWidth) / 2.0;
    scene.y += (oldViewportHeight - newViewportHeight) / 2.0;
  }

  function kickIt() {

    data.contextHelper.gl.clearColor(0.0, 0.0, 0.1, 1.0);
    data.contextHelper.gl.clearDepth(1.0);

    scene.velocity = scene.maxVelocity - 2 * scene.zoom;
    var program = {
      resize: function(gl, canvas) {
        data.viewportWidth = canvas.width;
        data.viewportHeight = canvas.height;
        changeZoom(scene.zoom);
        gl.viewport(0, 0, canvas.width, canvas.height);
        data.tileMap.resizeViewport(canvas.width, canvas.height);
      },
      draw: function (gl, timing) {
        var state = controller.sample();

        scene.maxVelocity = 400 - scene.zoom * (200 / scene.maxZoom());

        scene.x += state.xAxis * scene.maxVelocity;
        scene.y += state.yAxis * scene.maxVelocity;

        scene.x = Math.max(0, scene.x);
        scene.y = Math.max(0, scene.y);

        var shiftMap;

        if (okToOffsetCheck) {

          if (scene.x > (1 - scene.mapSwapThreshold) * scene.mapWidth() - 3 * scene.viewportWidth()) {
            okToOffsetCheck = false;
            shiftMap = Math.floor((data.tilesX / 2) - scene.mapSwapThreshold * data.tilesX);
            apply(shiftMap, 0, function () {
              scene.x -= shiftMap * data.tileWidth / scene.zoom;
              okToOffsetCheck = true;
            });
          } else
          if (scene.x < (scene.mapSwapThreshold) * scene.mapWidth()) {
            okToOffsetCheck = false;
            shiftMap = Math.floor((data.tilesX / 2) - scene.mapSwapThreshold * data.tilesX);
            apply(-shiftMap, 0, function () {
              scene.x += shiftMap * data.tileWidth / scene.zoom;
              okToOffsetCheck = true;
            });
          }
          if (scene.y > (1 - scene.mapSwapThreshold) * scene.mapHeight() - 2 * scene.viewportHeight()) {
            okToOffsetCheck = false;
            shiftMap = Math.floor((data.tilesY / 2) - scene.mapSwapThreshold * data.tilesY);
            apply(0, shiftMap, function () {
              scene.y -= shiftMap * data.tileHeight / scene.zoom;
              okToOffsetCheck = true;
            });
          } else
          if (scene.y < (scene.mapSwapThreshold) * scene.mapHeight()) {
            okToOffsetCheck = false;
            shiftMap = Math.floor((data.tilesY / 2) - scene.mapSwapThreshold * data.tilesY);
            apply(0, -shiftMap, function () {
              scene.y += shiftMap * data.tileHeight / scene.zoom;
              okToOffsetCheck = true;
            });
          }
        }

//        scene.x = Math.min(scene.x * scene.zoom,
//                data.mapWidth() - data.viewportWidth / scene.zoom) / scene.zoom;
//        scene.x = Math.max(0, scene.x);
//        scene.y = Math.min(scene.y * scene.zoom,
//                data.mapHeight() - data.viewportHeight / scene.zoom) / scene.zoom;
//        scene.y = Math.max(0, scene.y);

        if (state.Dup == 1) {
          data.waterElevation += 0.01;
          apply();
        }
        if (state.Ddown == 1) {
          data.waterElevation -= 0.01;
          apply();
        }
        if (state.Dleft == 1) {
          data.perlinFrequency += 0.002;
          apply();
        }
        if (state.Dright == 1) {
          data.perlinFrequency -= 0.002;
          apply();
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (state.y2Axis != 0) {
          changeZoom(scene.zoom + state.y2Axis * data.zoomChangeSpeed);
        }

        data.tileMap.setTileScale(scene.zoom);
        data.tileMap.draw(scene.x, scene.y);
      }
    };

    var stats = new Stats();
    document.getElementById("controls-container").appendChild(stats.domElement);

    data.contextHelper.start(program, stats);
  }

});
