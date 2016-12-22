(function() {
  window.Char = (function() {
    function Char(TL, TR, BL, BR) {
      var i, p, ref;
      this.TL = TL;
      this.TR = TR;
      this.BL = BL;
      this.BR = BR;
      this.brightness = 0;
      for (p = i = 0, ref = this.TL.data.length; i < ref; p = i += 4) {
        this.brightness += this.TL.data[p];
        this.brightness += this.TL.data[p + 1];
        this.brightness += this.TL.data[p + 2];
        this.brightness += this.TR.data[p];
        this.brightness += this.TR.data[p + 1];
        this.brightness += this.TR.data[p + 2];
        this.brightness += this.BL.data[p];
        this.brightness += this.BL.data[p + 1];
        this.brightness += this.BL.data[p + 2];
        this.brightness += this.BR.data[p];
        this.brightness += this.BR.data[p + 1];
        this.brightness += this.BR.data[p + 2];
      }
      this.selected = false;
      this.index = 0;
    }

    return Char;

  })();

}).call(this);
