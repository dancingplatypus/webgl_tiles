var require = {
  // Default load path for js files
  shim: {
    gamepad: {exports: 'gamepad'},
    detector: {exports: 'Detector'},
    stats: {exports: 'Stats'},
    Voronoi: {exports: 'Voronoi'},
    QuadTree: {exports: 'QuadTree'},
    perlinSimplex: {exports: 'PerlinSimplex'},
    perlinClassical: {exports: 'Perlin'}
  },

  paths: {
    lodash: '../bower_components/lodash/dist/lodash',
    controller: 'util/controller',
    utils: 'util/utils',
    options: 'options',
    gamepad: '../bower_components/gamepad.js/gamepad',
    stats: '../bower_components/stats.js/src/Stats',
    glMatrix: '../bower_components/gl-matrix/dist/gl-matrix',
    QuadTree: '../lib/QuadTree',
    Voronoi: '../lib/rhill-voronoi-core',
    perlinSimplex: '../lib/perlin/PerlinSimplex',
    perlinClassical: '../lib/perlin/Perlin'
  }
};
