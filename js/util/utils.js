define([], function() {

  return {

    /**
     * Given a number, make sure it falls within a range, changing its value to the
     * boundary if necessary.
     * @param {number} number
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    clamp: function(number, min, max) {
      return Math.max(Math.min(number, max), min);
    },

    /**
     * Given a number, make sure it falls outside of a range, changing its value to the closer of the
     * two boundaries if necessary.
     * @param {number} number
     * @param {number} range
     * @param {number=} opt_center
     * @return {number}
     */
    clampOutside: function(number, range, opt_center) {
      var center = opt_center || 0;
      return (number > center) ? Math.max(center + range, number) : Math.min(center - range, number);
    }
  };
});