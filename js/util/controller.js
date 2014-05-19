define(['utils'], function(util) {

  // Read the gamepad information.
  var gamepad;
  var gamepadIndex = -1;
  var getGamepads = navigator.getGamepads || navigator.webkitGetGamepads;
  getGamepads = getGamepads.bind(navigator);

  function stickThreshold(value, threshold) {
    var thres = threshold || 0.1;
    return (value > thres || value < -thres) ? value : 0;
  };

  var state = {
    xAxis: 0,
    yAxis: 0,
    x2Axis: 0,
    y2Axis: 0
  };

  return {

    /**
     * Sample the controller(s).
     */
    sample: function() {

      if (gamepadIndex !== -1) {
        gamepad = getGamepads[gamepadIndex];
      }
      if (!gamepad) {
        gamepad = _.first(getGamepads());
        if (gamepad) {
          gamepadIndex = gamepad.index;
        }
      }

      if (gamepad) {
        state.xAxis = stickThreshold(gamepad.axes[0]);
        state.yAxis = stickThreshold(gamepad.axes[1]);
        state.x2Axis = -stickThreshold(gamepad.axes[2]);
        state.y2Axis = -stickThreshold(gamepad.axes[3]);
        state.Dup = gamepad.buttons[12];
        state.Dleft = gamepad.buttons[14];
        state.Dright = gamepad.buttons[15];
        state.Ddown = gamepad.buttons[13];
      }

      return state;
    }

  };

});