(function() {
  window.imgToText = function(image, allCombos) {
    out;
    var BL, TL, TR, bestError, bestIndex, c, combos, error, i, j, k, l, p, r, ref, ref1, ref2;
    for (r = j = 0, ref = image.rows; 0 <= ref ? j < ref : j > ref; r = 0 <= ref ? ++j : --j) {
      for (c = k = 0, ref1 = image.cols; 0 <= ref1 ? k < ref1 : k > ref1; c = 0 <= ref1 ? ++k : --k) {
        TL = r > 0 && c > 0 ? out[r - 1][c - 1] : 0;
        TR = r > 0 ? out[r - 1][c] : 0;
        BL = c > 0 ? out[r][c - 1] : 0;
        combos = allCombos[TL][TR][BL];
        p = image.data[r][c];
        bestIndex = 0;
        bestError = 255;
        for (i = l = 0, ref2 = combos.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
          error = Math.abs(p - combos[i].brightness);
          if (error < bestError) {
            bestError = error;
            bestIndex = i;
          }
        }
        out[r][c] = bestIndex;
      }
    }
    return out;
  };

}).call(this);
