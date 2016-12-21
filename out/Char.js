(function() {
  window.Char = (function() {
    var brightness;

    brightness = 0;

    function Char(TL, TR, BL, BR) {
      var i, j, len, p, q, ref, ref1, selected;
      this.TL = TL;
      this.TR = TR;
      this.BL = BL;
      this.BR = BR;
      for (p = i = 0, ref = this.TL.data.length; i < ref; p = i += 4) {
        ref1 = [this.TL, this.TR, this.BL, this.BR];
        for (j = 0, len = ref1.length; j < len; j++) {
          q = ref1[j];
          this.brightness += q.data[p];
          this.brightness += q.data[p + 1];
          this.brightness += q.data[p + 2];
        }
      }
      selected = true;
    }

    return Char;

  })();

}).call(this);
