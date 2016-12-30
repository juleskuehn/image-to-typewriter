(function() {
  window.Combo = (function() {
    var brightness, image;

    image = [];

    brightness = 0;

    function Combo(TL, TR, BL, BR, charset, selected) {
      var chars, compStyle, ctx, ctx1, ctx2, ctx3, ctx4, cvs, cvs1, cvs2, cvs3, cvs4, i, img, j, k, l, m, p, ref, ref1, ref2, ref3, ref4;
      this.TL = TL;
      this.TR = TR;
      this.BL = BL;
      this.BR = BR;
      chars = selected;
      this.brightness = 0;
      this.BLbrightness = 0;
      this.BRbrightness = 0;
      this.TLbrightness = 0;
      this.TRbrightness = 0;
      compStyle = "multiply";
      cvs = document.createElement('canvas');
      cvs.width = charset.qWidth;
      cvs.height = charset.qHeight;
      ctx = cvs.getContext("2d");
      ctx.globalCompositeOperation = compStyle;
      cvs1 = document.createElement('canvas');
      cvs1.width = charset.qWidth / 2;
      cvs1.height = charset.qHeight / 2;
      ctx1 = cvs1.getContext("2d");
      ctx1.globalCompositeOperation = compStyle;
      cvs2 = document.createElement('canvas');
      cvs2.width = charset.qWidth / 2;
      cvs2.height = charset.qHeight / 2;
      ctx2 = cvs2.getContext("2d");
      ctx2.globalCompositeOperation = compStyle;
      cvs3 = document.createElement('canvas');
      cvs3.width = charset.qWidth / 2;
      cvs3.height = charset.qHeight / 2;
      ctx3 = cvs3.getContext("2d");
      ctx3.globalCompositeOperation = compStyle;
      cvs4 = document.createElement('canvas');
      cvs4.width = charset.qWidth / 2;
      cvs4.height = charset.qHeight / 2;
      ctx4 = cvs4.getContext("2d");
      ctx4.globalCompositeOperation = 'multiply';
      img = document.createElement("img");
      img.src = document.getElementById('charBR' + selected[this.TL].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx1.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx2.drawImage(img, -charset.qWidth / 2, 0, cvs.width, cvs.height);
      ctx3.drawImage(img, 0, -charset.qHeight / 2, cvs.width, cvs.height);
      ctx4.drawImage(img, -charset.qWidth / 2, -charset.qHeight / 2, cvs.width, cvs.height);
      img.src = document.getElementById('charBL' + selected[this.TR].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx1.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx2.drawImage(img, -charset.qWidth / 2, 0, cvs.width, cvs.height);
      ctx3.drawImage(img, 0, -charset.qHeight / 2, cvs.width, cvs.height);
      ctx4.drawImage(img, -charset.qWidth / 2, -charset.qHeight / 2, cvs.width, cvs.height);
      img.src = document.getElementById('charTR' + selected[this.BL].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx1.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx2.drawImage(img, -charset.qWidth / 2, 0, cvs.width, cvs.height);
      ctx3.drawImage(img, 0, -charset.qHeight / 2, cvs.width, cvs.height);
      ctx4.drawImage(img, -charset.qWidth / 2, -charset.qHeight / 2, cvs.width, cvs.height);
      img.src = document.getElementById('charTL' + selected[this.BR].index).toDataURL("image/png");
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx1.drawImage(img, 0, 0, cvs.width, cvs.height);
      ctx2.drawImage(img, -charset.qWidth / 2, 0, cvs.width, cvs.height);
      ctx3.drawImage(img, 0, -charset.qHeight / 2, cvs.width, cvs.height);
      ctx4.drawImage(img, -charset.qWidth / 2, -charset.qHeight / 2, cvs.width, cvs.height);
      this.image = ctx.getImageData(0, 0, cvs.width, cvs.height);
      this.imgTL = ctx1.getImageData(0, 0, cvs.width / 2, cvs.height / 2);
      this.imgTR = ctx2.getImageData(0, 0, cvs.width / 2, cvs.height / 2);
      this.imgBL = ctx3.getImageData(0, 0, cvs.width / 2, cvs.height / 2);
      this.imgBR = ctx4.getImageData(0, 0, cvs.width / 2, cvs.height / 2);
      for (p = i = 0, ref = this.image.data.length; i < ref; p = i += 4) {
        this.brightness += this.image.data[p];
        this.brightness += this.image.data[p + 1];
        this.brightness += this.image.data[p + 2];
      }
      for (p = j = 0, ref1 = this.imgTL.data.length; j < ref1; p = j += 4) {
        this.TLbrightness += this.imgTL.data[p];
        this.TLbrightness += this.imgTL.data[p + 1];
        this.TLbrightness += this.imgTL.data[p + 2];
      }
      for (p = k = 0, ref2 = this.imgTR.data.length; k < ref2; p = k += 4) {
        this.TRbrightness += this.imgTR.data[p];
        this.TRbrightness += this.imgTR.data[p + 1];
        this.TRbrightness += this.imgTR.data[p + 2];
      }
      for (p = l = 0, ref3 = this.imgBL.data.length; l < ref3; p = l += 4) {
        this.BLbrightness += this.imgBL.data[p];
        this.BLbrightness += this.imgBL.data[p + 1];
        this.BLbrightness += this.imgBL.data[p + 2];
      }
      for (p = m = 0, ref4 = this.imgBR.data.length; m < ref4; p = m += 4) {
        this.BRbrightness += this.imgBR.data[p];
        this.BRbrightness += this.imgBR.data[p + 1];
        this.BRbrightness += this.imgBR.data[p + 2];
      }
    }

    return Combo;

  })();

}).call(this);
