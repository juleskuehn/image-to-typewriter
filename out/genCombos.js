(function() {
  window.genCombos = function(charset) {
    var a, b, c, combos, d, i, j, k, l, ref, ref1, ref2, ref3;
    combos = [];
    for (a = i = 0, ref = charset.chars.length; 0 <= ref ? i < ref : i > ref; a = 0 <= ref ? ++i : --i) {
      combos.push([]);
      for (b = j = 0, ref1 = charset.chars.length; 0 <= ref1 ? j < ref1 : j > ref1; b = 0 <= ref1 ? ++j : --j) {
        combos[a].push([]);
        for (c = k = 0, ref2 = charset.chars.length; 0 <= ref2 ? k < ref2 : k > ref2; c = 0 <= ref2 ? ++k : --k) {
          combos[a][b].push([]);
          for (d = l = 0, ref3 = charset.chars.length; 0 <= ref3 ? l < ref3 : l > ref3; d = 0 <= ref3 ? ++l : --l) {
            combos[a][b][c].push(new Combo(a, b, c, d, charset));
          }
        }
      }
    }
    return combos;
  };

}).call(this);
