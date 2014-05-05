var require = {
  // Default load path for js files
  shim: {
    gamepad: {exports: 'gamepad'},
    detector: {exports: 'Detector'},
    stats: {exports: 'Stats'},
    _: {exports: '_'}
  },

  paths: {
    _: '../bower_components/lodash/dist/lodash',
    options: 'options',
    gamepad: '../bower_components/gamepad.js/gamepad',
    stats: '../bower_components/stats.js/src/Stats',
    glMatrix: '../bower_components/gl-matrix/dist/gl-matrix'
  }
};
