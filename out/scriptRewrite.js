(function() {
  var charset, drawCharImage, greyscale, imgToText, inputImage, target;

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
      var formField, formValues, k, len, ref;
      formValues = {};
      ref = ['rows', 'cols', 'rowStart', 'rowEnd', 'colStart', 'colEnd', 'offsetX', 'offsetY'];
      for (k = 0, len = ref.length; k < len; k++) {
        formField = ref[k];
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
        var col, k, m, numCols, numRows, ref, ref1, results, row;
        numRows = charset.settings.end[1] - charset.settings.start[1];
        numCols = charset.settings.end[0] - charset.settings.start[0];
        for (row = k = 0, ref = numRows + 1; 0 <= ref ? k <= ref : k >= ref; row = 0 <= ref ? ++k : --k) {
          ctx.beginPath();
          ctx.moveTo(start[0], start[1] + row * charHeight);
          ctx.lineTo(end[0] + offsetX, start[1] + row * charHeight);
          ctx.strokeStyle = "rgba(255,0,0,0.5)";
          ctx.stroke();
        }
        results = [];
        for (col = m = 0, ref1 = numCols + 1; 0 <= ref1 ? m <= ref1 : m >= ref1; col = 0 <= ref1 ? ++m : --m) {
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
      var BL, BR, TL, TR, char, charHeight, charWidth, col, ctx, k, len, m, maxBright, minBright, n, numCols, numRows, offsetX, offsetY, ref, ref1, ref2, resizeCanvasToMultiplesOfCharSize, row, start, startChar;
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
      for (row = k = 0, ref = numRows; 0 <= ref ? k <= ref : k >= ref; row = 0 <= ref ? ++k : --k) {
        for (col = m = 0, ref1 = numCols; 0 <= ref1 ? m <= ref1 : m >= ref1; col = 0 <= ref1 ? ++m : --m) {
          startChar = [start[0] + charWidth * col, start[1] + charHeight * row];
          TL = ctx.getImageData(Math.floor(startChar[0]), Math.floor(startChar[1]), Math.floor(charset.qWidth), Math.floor(charset.qHeight));
          TR = ctx.getImageData(Math.floor(startChar[0] + charWidth / 2), Math.floor(startChar[1]), Math.floor(charWidth), Math.floor(charHeight / 2));
          BL = ctx.getImageData(Math.floor(startChar[0]), Math.floor(startChar[1] + charset.qHeight), Math.floor(charset.qWidth), Math.floor(charset.qHeight * 2));
          BR = ctx.getImageData(Math.floor(startChar[0] + charset.qWidth), Math.floor(startChar[1] + charset.qHeight), Math.floor(charset.qWidth * 2), Math.floor(charset.qHeight * 2));
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
      for (n = 0, len = ref2.length; n < len; n++) {
        char = ref2[n];
        char.brightness = 255 - (255 * (char.brightness - minBright)) / (maxBright - minBright);
        console.log(char);
      }
      return charset.chars = _(charset.chars).sortBy('brightness');
    },
    drawCharQuadrants: function() {
      var char, drawQuadrant, i, k, ref, results;
      $('#charQuadrants').empty();
      results = [];
      for (i = k = 0, ref = charset.chars.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        char = charset.chars[i];
        drawQuadrant = function(quadrant, quadrantString) {
          var ctx, cvs, newCanvasHtml;
          newCanvasHtml = '<canvas id="char' + quadrantString + i + '" width="' + charset.qWidth * 2 + '" height="' + charset.qHeight * 2 + '"></canvas>';
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
      var char, ctx, cvs, drawChar, i, k, makeClickHandler, newCanvasHtml, ref, results;
      $('#viewSelect').empty();
      results = [];
      for (i = k = 0, ref = charset.chars.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
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
      var a, aa, b, bright, c, combo, combos, d, drawCombos, k, len, m, maxBright, minBright, n, o, q, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, selected, t, u, v, x, y, z;
      $('#comboPreview').empty();
      combos = [];
      selected = [];
      ref = charset.chars;
      for (k = 0, len = ref.length; k < len; k++) {
        c = ref[k];
        if (c.selected) {
          selected.push(c);
        }
      }
      for (a = m = 0, ref1 = selected.length; 0 <= ref1 ? m < ref1 : m > ref1; a = 0 <= ref1 ? ++m : --m) {
        combos.push([]);
        for (b = n = 0, ref2 = selected.length; 0 <= ref2 ? n < ref2 : n > ref2; b = 0 <= ref2 ? ++n : --n) {
          combos[a].push([]);
          for (c = o = 0, ref3 = selected.length; 0 <= ref3 ? o < ref3 : o > ref3; c = 0 <= ref3 ? ++o : --o) {
            combos[a][b].push([]);
            for (d = q = 0, ref4 = selected.length; 0 <= ref4 ? q < ref4 : q > ref4; d = 0 <= ref4 ? ++q : --q) {
              combos[a][b][c].push(new Combo(a, b, c, d, charset, selected));
            }
          }
        }
      }
      charset.combos = combos;
      minBright = 255;
      maxBright = 0;
      for (a = s = 0, ref5 = selected.length; 0 <= ref5 ? s < ref5 : s > ref5; a = 0 <= ref5 ? ++s : --s) {
        for (b = t = 0, ref6 = selected.length; 0 <= ref6 ? t < ref6 : t > ref6; b = 0 <= ref6 ? ++t : --t) {
          for (c = u = 0, ref7 = selected.length; 0 <= ref7 ? u < ref7 : u > ref7; c = 0 <= ref7 ? ++u : --u) {
            for (d = v = 0, ref8 = selected.length; 0 <= ref8 ? v < ref8 : v > ref8; d = 0 <= ref8 ? ++v : --v) {
              bright = charset.combos[a][b][c][d].brightness;
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
      for (a = x = 0, ref9 = selected.length; 0 <= ref9 ? x < ref9 : x > ref9; a = 0 <= ref9 ? ++x : --x) {
        for (b = y = 0, ref10 = selected.length; 0 <= ref10 ? y < ref10 : y > ref10; b = 0 <= ref10 ? ++y : --y) {
          for (c = z = 0, ref11 = selected.length; 0 <= ref11 ? z < ref11 : z > ref11; c = 0 <= ref11 ? ++z : --z) {
            for (d = aa = 0, ref12 = selected.length; 0 <= ref12 ? aa < ref12 : aa > ref12; d = 0 <= ref12 ? ++aa : --aa) {
              combo = charset.combos[a][b][c][d];
              combo.brightness = 255 - (255 * (combo.brightness - minBright)) / (maxBright - minBright);
            }
          }
        }
      }
      window.combos = combos;
      drawCombos = function() {
        var ab, ctx, cvs, id, newCanvasHtml, ref13, results;
        $('#comboPreview').empty();
        id = 0;
        results = [];
        for (a = ab = 0, ref13 = selected.length; 0 <= ref13 ? ab < ref13 : ab > ref13; a = 0 <= ref13 ? ++ab : --ab) {
          results.push((function() {
            var ac, ref14, results1;
            results1 = [];
            for (b = ac = 0, ref14 = selected.length; 0 <= ref14 ? ac < ref14 : ac > ref14; b = 0 <= ref14 ? ++ac : --ac) {
              results1.push((function() {
                var ad, ref15, results2;
                results2 = [];
                for (c = ad = 0, ref15 = selected.length; 0 <= ref15 ? ad < ref15 : ad > ref15; c = 0 <= ref15 ? ++ad : --ad) {
                  results2.push((function() {
                    var ae, ref16, results3;
                    results3 = [];
                    for (d = ae = 0, ref16 = selected.length; 0 <= ref16 ? ae < ref16 : ae > ref16; d = 0 <= ref16 ? ++ae : --ae) {
                      newCanvasHtml = '<canvas id="combo' + id + '" width="' + charset.qWidth + '" height="' + charset.qHeight + '"></canvas>';
                      $('#comboPreview').append(newCanvasHtml);
                      cvs = document.getElementById('combo' + id);
                      ctx = cvs.getContext("2d");
                      ctx.putImageData(charset.combos[a][b][c][d].image, 0, 0);
                      results3.push(id++);
                    }
                    return results3;
                  })());
                }
                return results2;
              })());
            }
            return results1;
          })());
        }
        return results;
      };
      return drawCombos();
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

  imgToText = function() {
    var b, c, closest, combosArray, cvs, dither, err, gr, h, i, j, k, len, m, n, ref, ref1, ref2, ref3, row, source, w;
    source = document.getElementById("inputImage");
    cvs = source.getContext('2d');
    dither = document.getElementById('dithering').checked;
    gr = greyscale(source);
    combosArray = [];
    ref = [source.height, source.width], h = ref[0], w = ref[1];
    for (i = k = 0, ref1 = h; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      row = [];
      for (j = m = 0, ref2 = w; 0 <= ref2 ? m < ref2 : m > ref2; j = 0 <= ref2 ? ++m : --m) {
        b = gr[i * w + j];
        closest = null;
        ref3 = charset.combos;
        for (n = 0, len = ref3.length; n < len; n++) {
          c = ref3[n];
          if (i === 0 && (c.chars[0] !== 0 || c.chars[1] !== 0)) {
            continue;
          }
          if (j === 0 && (c.chars[2] !== 0 || c.chars[3] !== 0)) {
            continue;
          }
          if (i === h - 1 && (c.chars[2] !== 0 || c.chars[3] !== 0)) {
            continue;
          }
          if (j === w - 1 && (c.chars[2] !== 0 || c.chars[3] !== 0)) {
            continue;
          }
          if (closest === null || Math.abs(c.brightness - b) < Math.abs(err)) {
            closest = c;
            err = b - c.brightness;
          }
        }
        if (dither) {
          gr[i * w + j] = c.brightness;
          if (j + 1 < w) {
            gr[i * w + j + 1] += err * 7 / 16;
          }
          if (i + 1 < h && j - 1 > 0) {
            gr[(i + 1) * w + j - 1] += err * 3 / 16;
          }
          if (i + 1 < h) {
            gr[(i + 1) * w + j] += err * 5 / 16;
          }
          if (i + 1 < h && j + 1 < w) {
            gr[(i + 1) * w + j + 1] += err * 1 / 16;
          }
        }
        row.push(closest.index);
      }
      combosArray.push(row);
    }
    return drawCharImage();
  };

  greyscale = function(canvas) {
    var b, customB, customG, customR, cvs, g, greyArray, greyscaleMethod, imgData, k, l, p, r, ref, ref1, ref2, ref3, ref4, ref5, ref6;
    greyscaleMethod = $('#bw').val();
    customR = $('#customR').val();
    customG = $('#customG').val();
    customB = $('#customB').val();
    greyArray = [];
    cvs = canvas.getContext('2d');
    imgData = cvs.getImageData(0, 0, canvas.width, canvas.height);
    imgData = imgData.data;
    for (p = k = 0, ref = imgData.length; k < ref; p = k += 4) {
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
    return greyArray;
  };

  drawCharImage = function() {
    var combo, ctx, i, inCanvas, j, k, outCanvas, ref, results;
    charset.combos = _(charset.combos).sortBy('index');
    inCanvas = document.getElementById('inputImage');
    outCanvas = document.getElementById('outputImage');
    outCanvas.width = charset.combos[0].imgData.width * inCanvas.width;
    outCanvas.height = charset.combos[0].imgData.height * inCanvas.height;
    ctx = outCanvas.getContext("2d");
    results = [];
    for (i = k = 0, ref = combosArray.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      results.push((function() {
        var m, ref1, results1;
        results1 = [];
        for (j = m = 0, ref1 = combosArray[0].length; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
          combo = charset.combos[combosArray[i][j]];
          results1.push(ctx.putImageData(combo.imgData, j * combo.imgData.width, i * combo.imgData.height));
        }
        return results1;
      })());
    }
    return results;
  };

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
          canvas.width = rowLength * 2;
          canvas.height = rowLength * aspectRatio * 2 * charAspect;
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
      return loadImage(source);
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

}).call(this);
