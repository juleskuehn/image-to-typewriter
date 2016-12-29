(function() {
  var bestCombos, charset, combosArray, drawCharImage, drawLayers, greyscale, imgToText, inputImage, target, theImage;

  charset = {
    previewCanvas: document.getElementById('charsetPreview'),
    overlayCanvas: document.getElementById('charsetOverlay'),
    workingCanvas: document.createElement('canvas'),
    settings: {
      gridSize: [20, 20],
      offset: [],
      start: [],
      end: []
    },
    chars: [],
    combos: [],
    qWidth: 0,
    qHeight: 0,
    getSettings: function() {
      var formField, formValues, len, m, ref;
      formValues = {};
      ref = ['rows', 'cols', 'rowStart', 'rowEnd', 'colStart', 'colEnd', 'offsetX', 'offsetY'];
      for (m = 0, len = ref.length; m < len; m++) {
        formField = ref[m];
        formValues[formField] = document.getElementById(formField).value;
      }
      charset.settings.gridSize = [(formValues.cols / 1) + 1, (formValues.rows / 1) + 1];
      charset.settings.offset = [formValues.offsetX, formValues.offsetY];
      charset.settings.start = [formValues.colStart, formValues.rowStart];
      return charset.settings.end = [formValues.colEnd, formValues.rowEnd];
    },
    chopPreview: function() {
      var charHeight, charWidth, ctx, drawGrid, end, lightboxSelection, offsetX, offsetY, start;
      ctx = charset.overlayCanvas.getContext('2d');
      charWidth = charset.overlayCanvas.width / charset.settings.gridSize[0];
      charHeight = charset.overlayCanvas.height / charset.settings.gridSize[1];
      offsetX = charWidth * charset.settings.offset[0];
      offsetY = charHeight * charset.settings.offset[1];
      start = [charset.settings.start[0] * charWidth + offsetX, charset.settings.start[1] * charHeight + offsetY];
      end = [charset.settings.end[0] * charWidth + 2 * offsetX, charset.settings.end[1] * charHeight + 2 * offsetY];
      lightboxSelection = function() {
        ctx.clearRect(0, 0, charset.overlayCanvas.width, charset.overlayCanvas.height);
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(0, 0, charset.overlayCanvas.width, charset.overlayCanvas.height);
        return ctx.clearRect(start[0], start[1], end[0] - start[0] + offsetX, end[1] - start[1] + offsetY);
      };
      lightboxSelection();
      drawGrid = function() {
        var col, m, numCols, numRows, o, ref, ref1, results, row;
        numRows = charset.settings.end[1] - charset.settings.start[1];
        numCols = charset.settings.end[0] - charset.settings.start[0];
        for (row = m = 0, ref = numRows + 1; 0 <= ref ? m <= ref : m >= ref; row = 0 <= ref ? ++m : --m) {
          ctx.beginPath();
          ctx.moveTo(start[0], start[1] + row * charHeight);
          ctx.lineTo(end[0] + offsetX, start[1] + row * charHeight);
          ctx.strokeStyle = "rgba(255,0,0,0.5)";
          ctx.stroke();
        }
        results = [];
        for (col = o = 0, ref1 = numCols + 1; 0 <= ref1 ? o <= ref1 : o >= ref1; col = 0 <= ref1 ? ++o : --o) {
          ctx.beginPath();
          ctx.moveTo(start[0] + col * charWidth, start[1]);
          ctx.lineTo(start[0] + col * charWidth, end[1] + offsetY);
          ctx.strokeStyle = "rgba(255,0,0,0.5)";
          results.push(ctx.stroke());
        }
        return results;
      };
      return drawGrid();
    },
    chopCharset: function() {
      var BL, BR, TL, TR, char, charHeight, charWidth, col, ctx, i, len, m, maxBright, minBright, numCols, numRows, o, offsetX, offsetY, q, ref, ref1, ref2, ref3, resizeCanvasToMultiplesOfCharSize, row, s, start, startChar;
      resizeCanvasToMultiplesOfCharSize = function() {
        var newHeight, newWidth, tempCanvas, wCanvas;
        wCanvas = charset.workingCanvas;
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = wCanvas.width;
        tempCanvas.height = wCanvas.height;
        tempCanvas.getContext('2d').drawImage(wCanvas, 0, 0);
        newWidth = Math.ceil(charset.workingCanvas.width / charset.settings.gridSize[0] / 4) * charset.settings.gridSize[0] * 4;
        newHeight = Math.ceil(charset.workingCanvas.height / charset.settings.gridSize[1] / 4) * charset.settings.gridSize[1] * 4;
        wCanvas.width = newWidth;
        wCanvas.height = newHeight;
        return wCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, wCanvas.width, wCanvas.height);
      };
      resizeCanvasToMultiplesOfCharSize();
      charset.chars = [];
      ctx = charset.workingCanvas.getContext('2d');
      charWidth = charset.workingCanvas.width / charset.settings.gridSize[0];
      charHeight = charset.workingCanvas.height / charset.settings.gridSize[1];
      offsetX = charWidth * charset.settings.offset[0];
      offsetY = charHeight * charset.settings.offset[1];
      start = [charset.settings.start[0] * charWidth + offsetX, charset.settings.start[1] * charHeight + offsetY];
      numRows = charset.settings.end[1] - charset.settings.start[1];
      numCols = charset.settings.end[0] - charset.settings.start[0];
      charset.qWidth = charWidth / 2;
      charset.qHeight = charHeight / 2;
      for (row = m = 0, ref = numRows; 0 <= ref ? m <= ref : m >= ref; row = 0 <= ref ? ++m : --m) {
        for (col = o = 0, ref1 = numCols; 0 <= ref1 ? o <= ref1 : o >= ref1; col = 0 <= ref1 ? ++o : --o) {
          startChar = [start[0] + charWidth * col, start[1] + charHeight * row];
          TL = ctx.getImageData(Math.floor(startChar[0]), Math.floor(startChar[1]), Math.floor(charset.qWidth), Math.floor(charset.qHeight));
          TR = ctx.getImageData(Math.floor(startChar[0] + charWidth / 2), Math.floor(startChar[1]), Math.floor(charset.qWidth), Math.floor(charset.qHeight));
          BL = ctx.getImageData(Math.floor(startChar[0]), Math.floor(startChar[1] + charset.qHeight), Math.floor(charset.qWidth), Math.floor(charset.qHeight));
          BR = ctx.getImageData(Math.floor(startChar[0] + charset.qWidth), Math.floor(startChar[1] + charset.qHeight), Math.floor(charset.qWidth), Math.floor(charset.qHeight));
          charset.chars.push(new Char(TL, TR, BL, BR));
        }
      }
      maxBright = _.max(charset.chars, function(w) {
        return w.brightness;
      }).brightness;
      minBright = _.min(charset.chars, function(w) {
        return w.brightness;
      }).brightness;
      ref2 = charset.chars;
      for (q = 0, len = ref2.length; q < len; q++) {
        char = ref2[q];
        char.brightness = 255 - (255 * (char.brightness - minBright)) / (maxBright - minBright);
      }
      charset.chars = _(charset.chars).sortBy('brightness');
      for (i = s = 0, ref3 = charset.chars.length; 0 <= ref3 ? s < ref3 : s > ref3; i = 0 <= ref3 ? ++s : --s) {
        charset.chars[i].index = i;
      }
      return console.log(charset.chars);
    },
    drawCharQuadrants: function() {
      var char, drawQuadrant, i, m, ref, results;
      $('#charQuadrants').empty();
      results = [];
      for (i = m = 0, ref = charset.chars.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        char = charset.chars[i];
        drawQuadrant = function(quadrant, quadrantString) {
          var ctx, cvs, newCanvasHtml;
          newCanvasHtml = '<canvas id="char' + quadrantString + i + '" width="' + charset.qWidth + '" height="' + charset.qHeight + '"></canvas>';
          $('#charQuadrants').append(newCanvasHtml);
          cvs = document.getElementById('char' + quadrantString + i);
          ctx = cvs.getContext("2d");
          return ctx.putImageData(quadrant, 0, 0);
        };
        drawQuadrant(char.TL, "TL");
        drawQuadrant(char.TR, "TR");
        drawQuadrant(char.BL, "BL");
        results.push(drawQuadrant(char.BR, "BR"));
      }
      return results;
    },
    drawCharSelect: function() {
      var char, ctx, cvs, drawChar, i, m, makeClickHandler, newCanvasHtml, ref, results;
      $('#viewSelect').empty();
      results = [];
      for (i = m = 0, ref = charset.chars.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        char = charset.chars[i];
        newCanvasHtml = '<canvas id="char' + i + '" width="' + charset.qWidth * 2 + '" height="' + charset.qHeight * 2 + '"></canvas>';
        $('#viewSelect').append(newCanvasHtml);
        cvs = document.getElementById('char' + i);
        ctx = cvs.getContext("2d");
        drawChar = function(char, ctx) {
          ctx.putImageData(char.TL, 0, 0);
          ctx.putImageData(char.TR, charset.qWidth, 0);
          ctx.putImageData(char.BL, 0, charset.qHeight);
          ctx.putImageData(char.BR, charset.qWidth, charset.qHeight);
          if (!char.selected) {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            return ctx.fillRect(0, 0, charset.qWidth * 2, charset.qHeight * 2);
          }
        };
        drawChar(char, ctx);
        makeClickHandler = function(char, ctx) {
          return $('#char' + i).click((function(e) {
            char.selected = !char.selected;
            ctx.clearRect(0, 0, charset.qWidth * 2, charset.qHeight * 2);
            return drawChar(char, ctx);
          }));
        };
        results.push(makeClickHandler(char, ctx));
      }
      return results;
    },
    genCombos: function() {
      var a, aa, ab, ac, b, bright, c, combo, combos, d, drawCombos, len, m, maxBright, minBright, o, q, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, selected, t, u, v, x, y, z;
      $('#comboPreview').empty();
      combos = [];
      selected = [];
      ref = charset.chars;
      for (m = 0, len = ref.length; m < len; m++) {
        c = ref[m];
        if (c.selected) {
          selected.push(c);
        }
      }
      for (a = o = 0, ref1 = selected.length; 0 <= ref1 ? o < ref1 : o > ref1; a = 0 <= ref1 ? ++o : --o) {
        combos.push([]);
        for (b = q = 0, ref2 = selected.length; 0 <= ref2 ? q < ref2 : q > ref2; b = 0 <= ref2 ? ++q : --q) {
          combos[a].push([]);
          for (c = s = 0, ref3 = selected.length; 0 <= ref3 ? s < ref3 : s > ref3; c = 0 <= ref3 ? ++s : --s) {
            combos[a][b].push([]);
            for (d = t = 0, ref4 = selected.length; 0 <= ref4 ? t < ref4 : t > ref4; d = 0 <= ref4 ? ++t : --t) {
              combos[a][b][c].push(new Combo(a, b, c, d, charset, selected));
            }
          }
        }
      }
      charset.combos = combos;
      minBright = 100000000;
      maxBright = 0;
      for (a = u = 0, ref5 = selected.length; 0 <= ref5 ? u < ref5 : u > ref5; a = 0 <= ref5 ? ++u : --u) {
        for (b = v = 0, ref6 = selected.length; 0 <= ref6 ? v < ref6 : v > ref6; b = 0 <= ref6 ? ++v : --v) {
          for (c = x = 0, ref7 = selected.length; 0 <= ref7 ? x < ref7 : x > ref7; c = 0 <= ref7 ? ++x : --x) {
            for (d = y = 0, ref8 = selected.length; 0 <= ref8 ? y < ref8 : y > ref8; d = 0 <= ref8 ? ++y : --y) {
              bright = charset.combos[a][b][c][d].TLbrightness;
              if (bright > maxBright) {
                maxBright = bright;
              }
              if (bright < minBright) {
                minBright = bright;
              }
              bright = charset.combos[a][b][c][d].TRbrightness;
              if (bright > maxBright) {
                maxBright = bright;
              }
              if (bright < minBright) {
                minBright = bright;
              }
              bright = charset.combos[a][b][c][d].BLbrightness;
              if (bright > maxBright) {
                maxBright = bright;
              }
              if (bright < minBright) {
                minBright = bright;
              }
              bright = charset.combos[a][b][c][d].BRbrightness;
              if (bright > maxBright) {
                maxBright = bright;
              }
              if (bright < minBright) {
                minBright = bright;
              }
            }
          }
        }
      }
      for (a = z = 0, ref9 = selected.length; 0 <= ref9 ? z < ref9 : z > ref9; a = 0 <= ref9 ? ++z : --z) {
        for (b = aa = 0, ref10 = selected.length; 0 <= ref10 ? aa < ref10 : aa > ref10; b = 0 <= ref10 ? ++aa : --aa) {
          for (c = ab = 0, ref11 = selected.length; 0 <= ref11 ? ab < ref11 : ab > ref11; c = 0 <= ref11 ? ++ab : --ab) {
            for (d = ac = 0, ref12 = selected.length; 0 <= ref12 ? ac < ref12 : ac > ref12; d = 0 <= ref12 ? ++ac : --ac) {
              combo = charset.combos[a][b][c][d];
              combo.brightness = 255 - (255 * (combo.brightness - minBright)) / (maxBright - minBright);
              combo.TLbrightness = 255 - (255 * (combo.TLbrightness - minBright)) / (maxBright - minBright);
              combo.TRbrightness = 255 - (255 * (combo.TRbrightness - minBright)) / (maxBright - minBright);
              combo.BLbrightness = 255 - (255 * (combo.BLbrightness - minBright)) / (maxBright - minBright);
              combo.BRbrightness = 255 - (255 * (combo.BRbrightness - minBright)) / (maxBright - minBright);
            }
          }
        }
      }

      /*
      
       * invert brightness
      for a in [0...selected.length]
        for b in [0...selected.length]
          for c in [0...selected.length]
            for d in [0...selected.length]
              combo = charset.combos[a][b][c][d]
              combo.brightness = 255 - (255*(combo.brightness)/maxBright)
              combo.TLbrightness = 255 - (255*(combo.TLbrightness)/maxBright)
              combo.TRbrightness = 255 - (255*(combo.TRbrightness)/maxBright)
              combo.BLbrightness = 255 - (255*(combo.BLbrightness)/maxBright)
              combo.BRbrightness = 255 - (255*(combo.BRbrightness)/maxBright)
       */
      console.log(combos);
      drawCombos = function() {
        var ad, ae, af, ag, ah, ctx, cvs, id, len1, newCanvasHtml, ref13, ref14, ref15, ref16, results, sortedCombos;
        $('#comboPreview').empty();
        sortedCombos = [];
        for (a = ad = 0, ref13 = selected.length; 0 <= ref13 ? ad < ref13 : ad > ref13; a = 0 <= ref13 ? ++ad : --ad) {
          for (b = ae = 0, ref14 = selected.length; 0 <= ref14 ? ae < ref14 : ae > ref14; b = 0 <= ref14 ? ++ae : --ae) {
            for (c = af = 0, ref15 = selected.length; 0 <= ref15 ? af < ref15 : af > ref15; c = 0 <= ref15 ? ++af : --af) {
              for (d = ag = 0, ref16 = selected.length; 0 <= ref16 ? ag < ref16 : ag > ref16; d = 0 <= ref16 ? ++ag : --ag) {
                sortedCombos.push(charset.combos[a][b][c][d]);
              }
            }
          }
        }
        sortedCombos = _(sortedCombos).sortBy('brightness');
        id = 0;
        results = [];
        for (ah = 0, len1 = sortedCombos.length; ah < len1; ah++) {
          combo = sortedCombos[ah];
          newCanvasHtml = '<canvas id="combo' + id + '" width="' + charset.qWidth + '" height="' + charset.qHeight + '"></canvas>';
          $('#comboPreview').append(newCanvasHtml);
          cvs = document.getElementById('combo' + id);
          ctx = cvs.getContext("2d");
          ctx.putImageData(combo.image, 0, 0);
          results.push(id++);
        }
        return results;
      };
      drawCombos();
      charset.selected = selected;
      return console.log(charset.selected);
    },
    dropImage: function(source) {
      var MAX_HEIGHT, loadImage, render, renderWorking;
      MAX_HEIGHT = $(window).height() - 100;
      render = function(src) {
        var image;
        image = new Image;
        image.onload = function() {
          var canvas, ctx;
          canvas = charset.previewCanvas;
          if (image.height > MAX_HEIGHT) {
            image.width *= MAX_HEIGHT / image.height;
            image.height = MAX_HEIGHT;
          }
          ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, image.width, image.height);
          canvas = charset.overlayCanvas;
          canvas.width = image.width;
          canvas.height = image.height;
        };
        image.src = src;
      };
      renderWorking = function(src) {
        var image;
        image = new Image;
        image.onload = function() {
          var canvas, ctx;
          canvas = charset.workingCanvas;
          ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, image.width, image.height);
        };
        image.src = src;
      };
      loadImage = function(src) {
        var reader;
        if (!src.type.match(/image.*/)) {
          console.log('The dropped file is not an image: ', src.type);
          return;
        }
        reader = new FileReader;
        reader.onload = function(e) {
          render(e.target.result);
          renderWorking(e.target.result);
        };
        reader.readAsDataURL(src);
      };
      return loadImage(source);
    }
  };

  combosArray = [];

  bestCombos = [];

  imgToText = function() {
    var BL, TL, TR, bBL, bBLb, bBLbr, bBLr, bBR, bBRb, bBRbr, bBRr, bTL, bTLb, bTLbr, bTLr, bTR, bTRb, bTRbr, bTRr, bestCombo, bestErr, closest, combo, comboRow, considerSpill, cvs, dither, ditherAmount, errBL, errBL1, errBR, errBR1, errTL, errTL1, errTR, errTR1, errTot, errTot1, errTotBottom, errTotBottomRight, errTotRight, gr, h, i, j, k, m, o, q, ref, ref1, ref2, ref3, row, source, spillBottom, spillBottomRight, spillBrightness, spillRatioBottom, spillRatioBottomRight, spillRatioRight, spillRight, w;
    combosArray = [];
    bestCombos = [];
    source = document.getElementById("inputImage");
    cvs = source.getContext('2d');
    dither = document.getElementById('dithering').checked;
    considerSpill = document.getElementById('considerSpill').checked;
    gr = greyscale(source);
    ref = [source.height, source.width], h = ref[0], w = ref[1];
    for (i = m = 0, ref1 = h; m < ref1; i = m += 2) {
      row = [];
      comboRow = [];
      for (j = o = 0, ref2 = w; o < ref2; j = o += 2) {
        bTL = gr[i * w + j];
        bTR = gr[i * w + j + 1];
        bBL = gr[(i + 1) * w + j];
        bBR = gr[(i + 1) * w + j + 1];
        bTLr = gr[i * w + j + 3];
        bTRr = gr[i * w + j + 4];
        bBLr = gr[(i + 1) * w + j + 3];
        bBRr = gr[(i + 1) * w + j + 4];
        bTLb = gr[(i + 2) * w + j];
        bTRb = gr[(i + 2) * w + j + 1];
        bBLb = gr[(i + 3) * w + j];
        bBRb = gr[(i + 3) * w + j + 1];
        bTLbr = gr[(i + 2) * w + j + 3];
        bTRbr = gr[(i + 2) * w + j + 4];
        bBLbr = gr[(i + 3) * w + j + 3];
        bBRbr = gr[(i + 3) * w + j + 4];
        TL = TR = BL = 0;
        if (i > 0 && j > 0) {
          TL = combosArray[i / 2 - 1][j / 2 - 1];
        }
        if (i > 0) {
          TR = combosArray[i / 2 - 1][j / 2];
        }
        if (j > 0) {
          BL = row[row.length - 1];
        }
        closest = 0;
        bestErr = 0;
        bestCombo = null;
        spillRatioRight = $('#spillRatioRight').val() * $('#spillRatio').val();
        spillRatioBottomRight = $('#spillRatioBottomRight').val() * $('#spillRatio').val();
        spillRatioBottom = $('#spillRatioBottom').val() * $('#spillRatio').val();
        spillBrightness = 1 - $('#spillBrightness').val();
        for (k = q = 0, ref3 = charset.combos[TL][TR][BL].length; 0 <= ref3 ? q < ref3 : q > ref3; k = 0 <= ref3 ? ++q : --q) {
          combo = charset.combos[TL][TR][BL][k];
          spillBottom = charset.combos[0][k][0][0];
          spillRight = charset.combos[0][0][k][0];
          spillBottomRight = charset.combos[k][0][0][0];
          errTL = errTL1 = bTL - combo.TLbrightness;
          errTR = errTR1 = bTR - combo.TRbrightness;
          errBL = errBL1 = bBL - combo.BLbrightness;
          errBR = errBR1 = bBR - combo.BRbrightness;
          errTot = errTot1 = (errTL + errTR + errBL + errBR) / 4;
          errTL = bTLb * spillBrightness - spillBottom.TLbrightness;
          errTR = bTRb * spillBrightness - spillBottom.TRbrightness;
          errBL = bBLb * spillBrightness - spillBottom.BLbrightness;
          errBR = bBRb * spillBrightness - spillBottom.BRbrightness;
          errTotBottom = (errTL + errTR + errBL + errBR) / 4;
          errTL = bTLr * spillBrightness - spillRight.TLbrightness;
          errTR = bTRr * spillBrightness - spillRight.TRbrightness;
          errBL = bBLr * spillBrightness - spillRight.BLbrightness;
          errBR = bBRr * spillBrightness - spillRight.BRbrightness;
          errTotRight = (errTL + errTR + errBL + errBR) / 4;
          errTL = bTLbr * spillBrightness - spillBottomRight.TLbrightness;
          errTR = bTRbr * spillBrightness - spillBottomRight.TRbrightness;
          errBL = bBLbr * spillBrightness - spillBottomRight.BLbrightness;
          errBR = bBRbr * spillBrightness - spillBottomRight.BRbrightness;
          errTotBottomRight = (errTL + errTR + errBL + errBR) / 4;
          if (considerSpill) {
            errTot = Math.abs(errTot) + Math.abs(errTotBottom) * spillRatioBottom + Math.abs(errTotRight) * spillRatioRight + Math.abs(errTotBottomRight) * spillRatioBottomRight;
          }
          if (bestCombo === null || Math.abs(errTot) < Math.abs(bestErr)) {
            bestErr = errTot;
            closest = k;
            bestCombo = combo;
          }
        }
        if (dither) {
          ditherAmount = document.getElementById('ditherAmount').value;
          if (document.getElementById('ditherFine').checked) {
            errTL = errTL1;
            errTR = errTR1;
            errBL = errBL1;
            errBR = errBR1;
          } else {
            errTL = errTR = errBL = errBR = errTot1;
          }
          if (j + 1 < w) {
            gr[i * w + j + 2] += (errTL * 7 / 16) * ditherAmount;
            gr[i * w + j + 3] += (errTR * 7 / 16) * ditherAmount;
            gr[(i + 1) * w + j + 2] += (errBL * 7 / 16) * ditherAmount;
            gr[(i + 1) * w + j + 3] += (errBR * 7 / 16) * ditherAmount;
          }
          if (i + 1 < h && j - 1 > 0) {
            gr[(i + 2) * w + j - 2] += (errTL * 3 / 16) * ditherAmount;
            gr[(i + 2) * w + j - 1] += (errTR * 3 / 16) * ditherAmount;
            gr[(i + 3) * w + j - 2] += (errBL * 3 / 16) * ditherAmount;
            gr[(i + 3) * w + j - 1] += (errBR * 3 / 16) * ditherAmount;
          }
          if (i + 1 < h) {
            gr[(i + 2) * w + j] += (errTL * 5 / 16) * ditherAmount;
            gr[(i + 2) * w + j + 1] += (errTR * 5 / 16) * ditherAmount;
            gr[(i + 3) * w + j] += (errBL * 5 / 16) * ditherAmount;
            gr[(i + 3) * w + j + 1] += (errBR * 5 / 16) * ditherAmount;
          }
          if (i + 1 < h && j + 1 < w) {
            gr[(i + 2) * w + j + 2] += (errTL * 1 / 16) * ditherAmount;
            gr[(i + 2) * w + j + 3] += (errTR * 1 / 16) * ditherAmount;
            gr[(i + 3) * w + j + 2] += (errBL * 1 / 16) * ditherAmount;
            gr[(i + 3) * w + j + 3] += (errBR * 1 / 16) * ditherAmount;
          }
        }
        row.push(closest);
        comboRow.push(bestCombo);
      }
      combosArray.push(row);
      bestCombos.push(comboRow);
    }
    console.log(combosArray);
    drawCharImage();
    return drawLayers();
  };

  drawCharImage = function() {
    var combo, ctx, i, inCanvas, j, m, outCanvas, ref, results;
    inCanvas = document.getElementById('inputImage');
    outCanvas = document.getElementById('outputImage');
    outCanvas.width = charset.qWidth * inCanvas.width / 2;
    outCanvas.height = charset.qHeight * inCanvas.height / 2;
    ctx = outCanvas.getContext("2d");
    ctx.clearRect(0, 0, outCanvas.width, outCanvas.height);
    results = [];
    for (i = m = 0, ref = bestCombos.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
      results.push((function() {
        var o, ref1, results1;
        results1 = [];
        for (j = o = 0, ref1 = bestCombos[0].length; 0 <= ref1 ? o < ref1 : o > ref1; j = 0 <= ref1 ? ++o : --o) {
          combo = bestCombos[i][j];
          results1.push(ctx.putImageData(combo.image, j * charset.qWidth, i * charset.qHeight));
        }
        return results1;
      })());
    }
    return results;
  };

  drawLayers = function() {
    var charLayer, ctx, i, j, layers, m, n, outCanvas, ref, results;
    layers = [];
    layers[0] = document.getElementById('layer1');
    layers[1] = document.getElementById('layer2');
    layers[2] = document.getElementById('layer3');
    layers[3] = document.getElementById('layer4');
    results = [];
    for (n = m = 0, ref = layers.length; 0 <= ref ? m < ref : m > ref; n = 0 <= ref ? ++m : --m) {
      outCanvas = layers[n];
      outCanvas.width = charset.qWidth * combosArray[0].length;
      outCanvas.height = charset.qHeight * combosArray.length;
      ctx = outCanvas.getContext("2d");
      ctx.clearRect(0, 0, outCanvas.width, outCanvas.height);
      results.push((function() {
        var o, ref1, results1;
        results1 = [];
        for (i = o = 0, ref1 = combosArray.length - 1; 0 <= ref1 ? o < ref1 : o > ref1; i = 0 <= ref1 ? ++o : --o) {
          results1.push((function() {
            var q, ref2, results2;
            results2 = [];
            for (j = q = 0, ref2 = combosArray[0].length - 1; 0 <= ref2 ? q < ref2 : q > ref2; j = 0 <= ref2 ? ++q : --q) {
              if (n = 0) {
                charLayer = charset.selected[combosArray[i][j]];
              }
              if (n = 2) {
                charLayer = charset.selected[combosArray[i][j + 1]];
              }
              if (n = 3) {
                charLayer = charset.selected[combosArray[i + 1][j]];
              }
              if (n = 4) {
                charLayer = charset.selected[combosArray[i + 1][j + 1]];
              }
              ctx.putImageData(charLayer.TL, i * charset.qWidth * 2, j * charset.qHeight * 2);
              ctx.putImageData(charLayer.TR, i * charset.qWidth * 2 + charset.qWidth, j * charset.qHeight * 2);
              ctx.putImageData(charLayer.BL, i * charset.qWidth * 2, j * charset.qHeight * 2 + charset.qHeight);
              results2.push(ctx.putImageData(charLayer.BR, i * charset.qWidth * 2 + charset.qWidth, j * charset.qHeight * 2 + charset.qHeight));
            }
            return results2;
          })());
        }
        return results1;
      })());
    }
    return results;
  };

  greyscale = function(canvas) {
    var b, customB, customG, customR, cvs, g, greyArray, greyscaleMethod, imgData, l, m, p, r, ref, ref1, ref2, ref3, ref4, ref5, ref6;
    greyscaleMethod = $('#bw').val();
    customR = $('#customR').val();
    customG = $('#customG').val();
    customB = $('#customB').val();
    greyArray = [];
    cvs = canvas.getContext('2d');
    imgData = cvs.getImageData(0, 0, canvas.width, canvas.height);
    imgData = imgData.data;
    for (p = m = 0, ref = imgData.length; m < ref; p = m += 4) {
      l = 0;
      if (greyscaleMethod === 'ccir') {
        ref1 = [0.2989, 0.5870, 0.1140], r = ref1[0], g = ref1[1], b = ref1[2];
      } else if (greyscaleMethod === 'cie') {
        ref2 = [0.2126, 0.7152, 0.0722], r = ref2[0], g = ref2[1], b = ref2[2];
      } else if (greyscaleMethod === 'flat') {
        ref3 = [0.3333, 0.3333, 0.3333], r = ref3[0], g = ref3[1], b = ref3[2];
      } else if (greyscaleMethod === 'red') {
        ref4 = [1, 0, 0], r = ref4[0], g = ref4[1], b = ref4[2];
      } else if (greyscaleMethod === 'green') {
        ref5 = [0, 1, 0], r = ref5[0], g = ref5[1], b = ref5[2];
      } else if (greyscaleMethod === 'blue') {
        ref6 = [0, 0, 1], r = ref6[0], g = ref6[1], b = ref6[2];
      }
      l += imgData[p] * r * customR * imgData[p + 3] / 255;
      l += imgData[p + 1] * g * customG * imgData[p + 3] / 255;
      l += imgData[p + 2] * b * customB * imgData[p + 3] / 255;
      l = 255 - l;
      greyArray.push(l);
    }

    /*
     * normalize image weights
    maxBright = _.max(greyArray)
    minBright = _.min(greyArray)
    for pixel in greyArray
      pixel = 255 - (255*(pixel-minBright))/(maxBright-minBright)
     */
    return greyArray;
  };

  theImage = '';

  inputImage = {
    dropImage: function(source) {
      var loadImage, render;
      render = function(src) {
        var image;
        image = new Image();
        image.onload = function() {
          var aspectRatio, canvas, charAspect, ctx, rowLength;
          rowLength = $('#row_length').val();
          canvas = document.getElementById('inputImage');
          ctx = canvas.getContext("2d");
          aspectRatio = image.height / image.width;
          charAspect = charset.chars[0].TL.width / charset.chars[0].TL.height;
          canvas.width = rowLength * 4;
          canvas.height = rowLength * aspectRatio * 4 * charAspect;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          return imgToText();
        };
        return image.src = src;
      };
      loadImage = function(src) {
        var reader;
        if (!src.type.match(/image.*/)) {
          console.log("The dropped file is not an image: ", src.type);
          return;
        }
        reader = new FileReader();
        reader.onload = function(e) {
          return render(e.target.result);
        };
        return reader.readAsDataURL(src);
      };
      loadImage(source);
      return theImage = source;
    }
  };

  $('#chopCharset').click(function() {
    charset.getSettings();
    charset.chopPreview();
    charset.chopCharset();
    charset.drawCharSelect();
    return charset.drawCharQuadrants();
  });

  $('#genCombos').click(function() {
    return charset.genCombos();
  });

  target = document.getElementById('charset-target');

  target.addEventListener('dragover', (function(e) {
    e.preventDefault();
  }), true);

  target.addEventListener('drop', (function(e) {
    e.preventDefault();
    charset.dropImage(e.dataTransfer.files[0]);
  }), true);

  target = document.getElementById('image-target');

  target.addEventListener('dragover', (function(e) {
    e.preventDefault();
  }), true);

  target.addEventListener('drop', (function(e) {
    e.preventDefault();
    inputImage.dropImage(e.dataTransfer.files[0]);
  }), true);

  $('#row_length').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#customR').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#customG').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#customB').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#bw').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#dithering').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#ditherFine').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#ditherAmount').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#considerSpill').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#spillRatio').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#spillRatioRight').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#spillRatioBottom').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#spillRatioBottomRight').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#spillBrightness').change(function() {
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $(document).ready(function() {
    var downloadCanvas;
    document.getElementById("outputImage").setAttribute('crossOrigin', 'anonymous');
    downloadCanvas = function(link, canvasId, filename) {
      link.href = document.getElementById(canvasId).toDataURL();
      return link.download = filename;
    };
    return document.getElementById('download').addEventListener('click', function() {
      return downloadCanvas(this, 'outputImage', 'asciiOutput.png');
    }, false);
  });

}).call(this);
