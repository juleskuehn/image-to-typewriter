(function() {
  window.Combo = (function() {
    var brightness, image;

    image = [];

    brightness = 0;

    function Combo(TL, TR, BL, BR, charset, selected) {
      var chars, ctx, cvs, i, img, p, ref;
      this.TL = TL;
      this.TR = TR;
      this.BL = BL;
      this.BR = BR;
      chars = selected;
      this.brightness = 0;
      cvs = document.createElement('canvas');
      cvs.width = charset.qWidth;
      cvs.height = charset.qHeight;
      ctx = cvs.getContext("2d");
      ctx.globalCompositeOperation = 'multiply';
      img = document.createElement("img");
      img.src = document.getElementById('charBR' + selected[this.TL].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      img.src = document.getElementById('charBL' + selected[this.TR].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      img.src = document.getElementById('charTR' + selected[this.BL].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      img.src = document.getElementById('charTL' + selected[this.BR].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      this.image = ctx.getImageData(0, 0, cvs.width, cvs.height);
      for (p = i = 0, ref = this.image.data.length; i < ref; p = i += 4) {
        this.brightness += this.image.data[p];
        this.brightness += this.image.data[p + 1];
        this.brightness += this.image.data[p + 2];
      }
    }

    return Combo;

  })();

}).call(this);
