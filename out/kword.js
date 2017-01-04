(function() {
  var bestCombos, charset, chopCharset, combosArray, drawCharImage, drawLayers, greyscale, imgToText, inputImage, target, theImage, updateContainer;

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
        var col, m, n, numCols, numRows, ref, ref1, results, row;
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
        for (col = n = 0, ref1 = numCols + 1; 0 <= ref1 ? n <= ref1 : n >= ref1; col = 0 <= ref1 ? ++n : --n) {
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
      var BL, BR, TL, TR, char, charHeight, charWidth, col, ctx, i, len, m, maxBright, minBright, n, numCols, numRows, o, offsetX, offsetY, q, ref, ref1, ref2, ref3, resizeCanvasToMultiplesOfCharSize, results, row, start, startChar;
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
        for (col = n = 0, ref1 = numCols; 0 <= ref1 ? n <= ref1 : n >= ref1; col = 0 <= ref1 ? ++n : --n) {
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
      for (o = 0, len = ref2.length; o < len; o++) {
        char = ref2[o];
        char.brightness = 255 - (255 * (char.brightness - minBright)) / (maxBright - minBright);
      }
      charset.chars = _(charset.chars).sortBy('brightness');
      results = [];
      for (i = q = 0, ref3 = charset.chars.length; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
        results.push(charset.chars[i].index = i);
      }
      return results;
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
      var char, ctx, cvs, drawChar, i, m, makeClickHandler, newCanvasHtml, ref, spaceWeight;
      $('#viewSelect').empty();
      for (i = m = 0, ref = charset.chars.length; 0 <= ref ? m < ref : m > ref; i = 0 <= ref ? ++m : --m) {
        char = charset.chars[i];
        spaceWeight;
        if (i === 0) {
          spaceWeight = char.brightness;
          char.selected = true;
        } else if (Math.abs(char.brightness - spaceWeight) < 10) {
          continue;
        }
        if (i === charset.chars.length - 1) {
          char.selected = true;
        }
        if (i === Math.round(charset.chars.length * 0.5)) {
          char.selected = true;
        }
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
        makeClickHandler(char, ctx);
      }
      return updateContainer();
    },
    genCombos: function() {
      var a, aa, ab, b, bright, c, combo, combos, d, drawCombos, len, m, maxBright, minBright, n, o, q, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, selected, t, u, v, x, y, z;
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
      for (a = n = 0, ref1 = selected.length; 0 <= ref1 ? n < ref1 : n > ref1; a = 0 <= ref1 ? ++n : --n) {
        combos.push([]);
        for (b = o = 0, ref2 = selected.length; 0 <= ref2 ? o < ref2 : o > ref2; b = 0 <= ref2 ? ++o : --o) {
          combos[a].push([]);
          for (c = q = 0, ref3 = selected.length; 0 <= ref3 ? q < ref3 : q > ref3; c = 0 <= ref3 ? ++q : --q) {
            combos[a][b].push([]);
            for (d = s = 0, ref4 = selected.length; 0 <= ref4 ? s < ref4 : s > ref4; d = 0 <= ref4 ? ++s : --s) {
              combos[a][b][c].push(new Combo(a, b, c, d, charset, selected));
            }
          }
        }
      }
      charset.combos = combos;
      minBright = 100000000;
      maxBright = 0;
      for (a = t = 0, ref5 = selected.length; 0 <= ref5 ? t < ref5 : t > ref5; a = 0 <= ref5 ? ++t : --t) {
        for (b = u = 0, ref6 = selected.length; 0 <= ref6 ? u < ref6 : u > ref6; b = 0 <= ref6 ? ++u : --u) {
          for (c = v = 0, ref7 = selected.length; 0 <= ref7 ? v < ref7 : v > ref7; c = 0 <= ref7 ? ++v : --v) {
            for (d = x = 0, ref8 = selected.length; 0 <= ref8 ? x < ref8 : x > ref8; d = 0 <= ref8 ? ++x : --x) {
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
      for (a = y = 0, ref9 = selected.length; 0 <= ref9 ? y < ref9 : y > ref9; a = 0 <= ref9 ? ++y : --y) {
        for (b = z = 0, ref10 = selected.length; 0 <= ref10 ? z < ref10 : z > ref10; b = 0 <= ref10 ? ++z : --z) {
          for (c = aa = 0, ref11 = selected.length; 0 <= ref11 ? aa < ref11 : aa > ref11; c = 0 <= ref11 ? ++aa : --aa) {
            for (d = ab = 0, ref12 = selected.length; 0 <= ref12 ? ab < ref12 : ab > ref12; d = 0 <= ref12 ? ++ab : --ab) {
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
      drawCombos = function() {
        var ac, ad, ae, af, ag, ctx, cvs, id, len1, newCanvasHtml, ref13, ref14, ref15, ref16, results, sortedCombos;
        $('#comboPreview').empty();
        sortedCombos = [];
        for (a = ac = 0, ref13 = selected.length; 0 <= ref13 ? ac < ref13 : ac > ref13; a = 0 <= ref13 ? ++ac : --ac) {
          for (b = ad = 0, ref14 = selected.length; 0 <= ref14 ? ad < ref14 : ad > ref14; b = 0 <= ref14 ? ++ad : --ad) {
            for (c = ae = 0, ref15 = selected.length; 0 <= ref15 ? ae < ref15 : ae > ref15; c = 0 <= ref15 ? ++ae : --ae) {
              for (d = af = 0, ref16 = selected.length; 0 <= ref16 ? af < ref16 : af > ref16; d = 0 <= ref16 ? ++af : --af) {
                sortedCombos.push(charset.combos[a][b][c][d]);
              }
            }
          }
        }
        sortedCombos = _(sortedCombos).sortBy('brightness');
        id = 0;
        results = [];
        for (ag = 0, len1 = sortedCombos.length; ag < len1; ag++) {
          combo = sortedCombos[ag];
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
      return charset.selected = selected;
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
    var BL, TL, TR, bBL, bBLb, bBLbr, bBLr, bBR, bBRb, bBRbr, bBRr, bTL, bTLb, bTLbr, bTLr, bTR, bTRb, bTRbr, bTRr, bestCombo, bestErr, closest, combo, comboRow, considerSpill, cvs, dither, ditherAmount, errBL, errBL1, errBR, errBR1, errTL, errTL1, errTR, errTR1, errTot, errTot1, errTotBottom, errTotBottomRight, errTotRight, gr, h, i, j, k, m, n, o, ref, ref1, ref2, ref3, row, source, spillBottom, spillBottomRight, spillBrightness, spillRatioBottom, spillRatioBottomRight, spillRatioRight, spillRight, w;
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
      for (j = n = 0, ref2 = w; n < ref2; j = n += 2) {
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
        for (k = o = 0, ref3 = charset.combos[TL][TR][BL].length; 0 <= ref3 ? o < ref3 : o > ref3; k = 0 <= ref3 ? ++o : --o) {
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
    drawCharImage();
    return updateContainer();
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
        var n, ref1, results1;
        results1 = [];
        for (j = n = 0, ref1 = bestCombos[0].length; 0 <= ref1 ? n < ref1 : n > ref1; j = 0 <= ref1 ? ++n : --n) {
          combo = bestCombos[i][j];
          results1.push(ctx.putImageData(combo.image, j * charset.qWidth, i * charset.qHeight));
        }
        return results1;
      })());
    }
    return results;
  };

  drawLayers = function() {
    var charLayer1, charLayer2, charLayer3, charLayer4, ctx1, ctx2, ctx3, ctx4, i, j, layer1, layer2, layer3, layer4, m, outCanvas, outCanvas1, outCanvas2, outCanvas3, outCanvas4, ref, results;
    console.log(combosArray);
    layer1 = document.getElementById('layer1');
    layer2 = document.getElementById('layer2');
    layer3 = document.getElementById('layer3');
    layer4 = document.getElementById('layer4');
    outCanvas = outCanvas1 = layer1;
    outCanvas1.width = charset.qWidth * combosArray[0].length;
    outCanvas1.height = charset.qHeight * combosArray.length;
    ctx1 = outCanvas1.getContext("2d");
    ctx1.clearRect(0, 0, outCanvas.width, outCanvas.height);
    outCanvas2 = layer2;
    outCanvas2.width = charset.qWidth * combosArray[0].length;
    outCanvas2.height = charset.qHeight * combosArray.length;
    ctx2 = outCanvas2.getContext("2d");
    ctx2.clearRect(0, 0, outCanvas.width, outCanvas.height);
    outCanvas3 = layer3;
    outCanvas3.width = charset.qWidth * combosArray[0].length;
    outCanvas3.height = charset.qHeight * combosArray.length;
    ctx3 = outCanvas3.getContext("2d");
    ctx3.clearRect(0, 0, outCanvas.width, outCanvas.height);
    outCanvas4 = layer4;
    outCanvas4.width = charset.qWidth * combosArray[0].length;
    outCanvas4.height = charset.qHeight * combosArray.length;
    ctx4 = outCanvas4.getContext("2d");
    ctx4.clearRect(0, 0, outCanvas.width, outCanvas.height);
    results = [];
    for (i = m = 0, ref = combosArray.length - 1; m < ref; i = m += 2) {
      results.push((function() {
        var n, ref1, results1;
        results1 = [];
        for (j = n = 0, ref1 = combosArray[0].length - 1; n < ref1; j = n += 2) {
          charLayer1 = charset.selected[combosArray[i][j]];
          charLayer2 = charset.selected[combosArray[i][j + 1]];
          charLayer3 = charset.selected[combosArray[i + 1][j]];
          charLayer4 = charset.selected[combosArray[i + 1][j + 1]];
          ctx1.putImageData(charLayer1.TL, j * charset.qWidth, i * charset.qHeight);
          ctx1.putImageData(charLayer1.TR, j * charset.qWidth + charset.qWidth, i * charset.qHeight);
          ctx1.putImageData(charLayer1.BL, j * charset.qWidth, i * charset.qHeight + charset.qHeight);
          ctx1.putImageData(charLayer1.BR, j * charset.qWidth + charset.qWidth, i * charset.qHeight + charset.qHeight);
          ctx2.putImageData(charLayer2.TL, j * charset.qWidth, i * charset.qHeight);
          ctx2.putImageData(charLayer2.TR, j * charset.qWidth + charset.qWidth, i * charset.qHeight);
          ctx2.putImageData(charLayer2.BL, j * charset.qWidth, i * charset.qHeight + charset.qHeight);
          ctx2.putImageData(charLayer2.BR, j * charset.qWidth + charset.qWidth, i * charset.qHeight + charset.qHeight);
          ctx3.putImageData(charLayer3.TL, j * charset.qWidth, i * charset.qHeight);
          ctx3.putImageData(charLayer3.TR, j * charset.qWidth + charset.qWidth, i * charset.qHeight);
          ctx3.putImageData(charLayer3.BL, j * charset.qWidth, i * charset.qHeight + charset.qHeight);
          ctx3.putImageData(charLayer3.BR, j * charset.qWidth + charset.qWidth, i * charset.qHeight + charset.qHeight);
          ctx4.putImageData(charLayer4.TL, j * charset.qWidth, i * charset.qHeight);
          ctx4.putImageData(charLayer4.TR, j * charset.qWidth + charset.qWidth, i * charset.qHeight);
          ctx4.putImageData(charLayer4.BL, j * charset.qWidth, i * charset.qHeight + charset.qHeight);
          results1.push(ctx4.putImageData(charLayer4.BR, j * charset.qWidth + charset.qWidth, i * charset.qHeight + charset.qHeight));
        }
        return results1;
      })());
    }
    return results;
  };

  greyscale = function(canvas) {
    var b, customB, customG, customR, cvs, g, greyArray, greyscaleMethod, imgData, l, m, maxAdjust, minAdjust, normalize, p, r, ref, ref1, ref2, ref3, ref4, ref5, ref6;
    greyscaleMethod = $('#bw').val();
    customR = $('#customR').val();
    customG = $('#customG').val();
    customB = $('#customB').val();
    normalize = document.getElementById('normalize').checked;
    minAdjust = $('#minAdjust').val();
    maxAdjust = $('#maxAdjust').val();
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
      l = 255 - l * minAdjust;
      l *= maxAdjust;
      greyArray.push(l);
    }
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

  chopCharset = function() {
    charset.getSettings();
    charset.chopPreview();
    charset.chopCharset();
    charset.drawCharSelect();
    return charset.drawCharQuadrants();
  };

  $('#chopCharset').click(function() {
    return chopCharset();
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

  $(document).ready(function() {
    var downloadCanvas;
    document.getElementById("outputImage").setAttribute('crossOrigin', 'anonymous');
    downloadCanvas = function(link, canvasId, filename) {
      link.href = document.getElementById(canvasId).toDataURL();
      return link.download = filename;
    };
    document.getElementById('download').addEventListener('click', function() {
      return downloadCanvas(this, 'outputImage', 'kword_mockup.png');
    }, false);
    document.getElementById("layer1").setAttribute('crossOrigin', 'anonymous');
    document.getElementById('download_layer_1').addEventListener('click', function() {
      return downloadCanvas(this, 'layer1', 'kword_layer1_TopLeft.png');
    }, false);
    document.getElementById("layer2").setAttribute('crossOrigin', 'anonymous');
    document.getElementById('download_layer_2').addEventListener('click', function() {
      return downloadCanvas(this, 'layer2', 'kword_layer2_TopRight.png');
    }, false);
    document.getElementById("layer3").setAttribute('crossOrigin', 'anonymous');
    document.getElementById('download_layer_3').addEventListener('click', function() {
      return downloadCanvas(this, 'layer3', 'kword_layer3_BottomLeft.png');
    }, false);
    document.getElementById("layer4").setAttribute('crossOrigin', 'anonymous');
    return document.getElementById('download_layer_4').addEventListener('click', function() {
      return downloadCanvas(this, 'layer4', 'kword_layer4_BottomRight.png');
    }, false);
  });

  $('#tabs button').click(function() {
    var id;
    $('#tabs button.selected').removeClass('selected');
    $(this).addClass('selected');
    id = $(this).attr('id');
    $('#viewport div.show').removeClass('show');
    $('#view_' + id).addClass('show');
    $('#charset_options').addClass('show');
    $('#downloads').removeClass('show');
    $('#image_options').removeClass('show');
    return updateContainer();
  });

  $('#show_image_text').click(function() {
    var id;
    $('#tabs button.selected').removeClass('selected');
    $(this).addClass('selected');
    id = $(this).attr('id');
    $('#viewport div.show').removeClass('show');
    $('#view_' + id).addClass('show');
    $('#charset_options').removeClass('show');
    $('#downloads').removeClass('show');
    $('#image_options').addClass('show');
    return updateContainer();
  });

  $('#show_layers').click(function() {
    var id;
    $('#tabs button.selected').removeClass('selected');
    $(this).addClass('selected');
    id = $(this).attr('id');
    $('#viewport div.show').removeClass('show');
    $('#view_' + id).addClass('show');
    $('#charset_options').removeClass('show');
    $('#image_options').removeClass('show');
    $('#downloads').addClass('show');
    drawLayers();
    return updateContainer();
  });

  $('input').change(function() {
    chopCharset();
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('select').change(function() {
    chopCharset();
    if (theImage !== '') {
      return inputImage.dropImage(theImage);
    }
  });

  $('#zoom').click(function() {
    if ($('body').hasClass('noZoom')) {
      $('body').removeClass('noZoom');
    } else {
      $('body').addClass('noZoom');
    }
    return updateContainer();
  });

  $('#closeInstructions').click(function() {
    if ($('#instructions').hasClass('hidden')) {
      return $('#instructions').removeClass('hidden');
    } else {
      return $('#instructions').addClass('hidden');
    }
  });

  $(document).ready(function() {
    updateContainer();
    return $(window).resize(function() {
      return updateContainer();
    });
  });

  updateContainer = function() {
    var h, w;
    h = $(window).height();
    w = $(window).width();
    $('#viewport').css({
      "width": w - 221 + "px"
    }).css({
      "height": h - 30 + "px"
    });
    return $('canvas.resize').each(function() {
      var scaleX, scaleY;
      scaleX = scaleY = 100;
      if ($(this).width() > $('#viewport').width()) {
        scaleX = ($('#viewport').width() / $(this).width()) * 100;
      }
      if ($(this).height() > $('#viewport').height()) {
        scaleY = ($('#viewport').height() / $(this).height()) * 100;
      }
      return $(this).css({
        "zoom": Math.min(scaleY, scaleX) + "%"
      });
    });
  };

}).call(this);
