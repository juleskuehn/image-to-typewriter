(function() {
  window.Combo = (function() {
    function Combo(TL, TR, BL, BR, charset, selected) {
      var ctx, cvs, i, image, img, imgBL, imgBR, imgTL, imgTR, j, k, len, len1, m, p, q, ref, ref1, ref2, ref3, x, y;
      this.TL = TL;
      this.TR = TR;
      this.BL = BL;
      this.BR = BR;
      imgTL = document.getElementById('charBR' + selected[this.TL].index).toDataURL("image/png");
      imgTR = document.getElementById('charBL' + selected[this.TR].index).toDataURL("image/png");
      imgBL = document.getElementById('charTR' + selected[this.BL].index).toDataURL("image/png");
      imgBR = document.getElementById('charTL' + selected[this.BR].index).toDataURL("image/png");
      ref = ["", "TL", "TR", "BL", "BR"];
      for (i = 0, len = ref.length; i < len; i++) {
        q = ref[i];
        if (q === "") {
          m = 1;
        } else {
          m = 0.5;
        }
        ref1 = (function() {
          switch (false) {
            case q !== "TR":
              return [-charset.qWidth / 2, 0];
            case q !== "BL":
              return [0, -charset.qHeight / 2];
            case q !== "BR":
              return [-charset.qWidth / 2, -charset.qHeight / 2];
            default:
              return [0, 0];
          }
        })(), x = ref1[0], y = ref1[1];
        cvs = document.createElement('canvas');
        cvs.width = charset.qWidth * m;
        cvs.height = charset.qHeight * m;
        ctx = cvs.getContext("2d");
        ctx.globalCompositeOperation = "multiply";
        img = document.createElement("img");
        ref2 = [imgTL, imgTR, imgBL, imgBR];
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          image = ref2[j];
          img.src = image;
          ctx.drawImage(img, x, y, cvs.width, cvs.height);
        }
        this["img" + q] = ctx.getImageData(0, 0, cvs.width, cvs.height);
        this[q + "brightness"] = 0;
        for (p = k = 0, ref3 = this["img" + q].data.length; k < ref3; p = k += 4) {
          this[q + "brightness"] += this["img" + q].data[p] + this["img" + q].data[p + 1] + this["img" + q].data[p + 2];
        }
      }
      this.image = this.img;
    }

    return Combo;

  })();

}).call(this);
