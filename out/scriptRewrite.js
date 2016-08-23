(function() {
  var charset, greyscale, imgToText, inputImage, target;

  charset = {
    previewCanvas: document.getElementById('charsetPreview'),
    overlayCanvas: document.getElementById('charsetOverlay'),
    workingCanvas: document.createElement('canvas'),
    settings: {
      keystones: [[], [], [], []],
      gridSize: [20, 20],
      offset: [],
      start: [],
      end: []
    },
    chars: [],
    combos: [],
    overlaps: [[0, 0], [0, 0.5], [0.5, 0]],
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
        console.log(' start = ' + start);
        console.log(' end = ' + end);
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
      var char, charHeight, charWidth, col, ctx, i, imgData, k, len, m, maxWeight, minWeight, n, numCols, numRows, o, offsetX, offsetY, p, ref, ref1, ref2, ref3, resizeCanvasToMultiplesOfCharSize, results, row, start, startChar, weight;
      resizeCanvasToMultiplesOfCharSize = function() {
        var newHeight, newWidth, tempCanvas, wCanvas;
        wCanvas = charset.workingCanvas;
        tempCanvas = document.createElement('canvas');
        tempCanvas.width = wCanvas.width;
        tempCanvas.height = wCanvas.height;
        tempCanvas.getContext('2d').drawImage(wCanvas, 0, 0);
        newWidth = Math.ceil(charset.workingCanvas.width / charset.settings.gridSize[0]) * charset.settings.gridSize[0];
        newHeight = Math.ceil(charset.workingCanvas.height / charset.settings.gridSize[1]) * charset.settings.gridSize[1];
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
      i = 0;
      for (row = k = 0, ref = numRows; 0 <= ref ? k <= ref : k >= ref; row = 0 <= ref ? ++k : --k) {
        for (col = m = 0, ref1 = numCols; 0 <= ref1 ? m <= ref1 : m >= ref1; col = 0 <= ref1 ? ++m : --m) {
          startChar = [start[0] + charWidth * col, start[1] + charHeight * row];
          imgData = ctx.getImageData(Math.floor(startChar[0]), Math.floor(startChar[1]), Math.floor(charWidth), Math.floor(charHeight));
          weight = 0;
          for (p = n = 0, ref2 = imgData.data.length; n < ref2; p = n += 4) {
            weight += imgData.data[p];
            weight += imgData.data[p + 1];
            weight += imgData.data[p + 2];
          }
          char = {
            imgData: imgData,
            weight: weight,
            selected: true,
            space: false,
            index: i
          };
          charset.chars.push(char);
          i++;
        }
      }
      charset.chars = _(charset.chars).sortBy('weight');
      maxWeight = _.max(charset.chars, function(w) {
        return w.weight;
      }).weight;
      minWeight = _.min(charset.chars, function(w) {
        return w.weight;
      }).weight;
      ref3 = charset.chars;
      results = [];
      for (o = 0, len = ref3.length; o < len; o++) {
        char = ref3[o];
        results.push(char.brightness = 255 - (255 * (char.weight - minWeight)) / (maxWeight - minWeight));
      }
      return results;
    },
    drawCharSelect: function() {
      var char, ctx, cvs, k, len, makeClickHandler, newCanvasHtml, ref, results;
      $('#viewSelect').empty();
      ref = charset.chars;
      results = [];
      for (k = 0, len = ref.length; k < len; k++) {
        char = ref[k];
        newCanvasHtml = '<canvas id="char' + char.index + '" width="' + char.imgData.width + '" height="' + char.imgData.height + '"></canvas>';
        $('#viewSelect').append(newCanvasHtml);
        cvs = document.getElementById('char' + char.index);
        ctx = cvs.getContext("2d");
        ctx.putImageData(char.imgData, 0, 0);
        makeClickHandler = function(char) {
          return $('#char' + char.index).click((function(e) {
            cvs = document.getElementById('char' + char.index);
            ctx = cvs.getContext("2d");
            if (e.ctrlKey) {
              char.space = !char.space;
            } else {
              char.selected = !char.selected;
            }
            ctx.clearRect(0, 0, char.imgData.width, char.imgData.height);
            ctx.putImageData(char.imgData, 0, 0);
            if (!char.selected) {
              ctx.fillStyle = "rgba(0,0,0,0.5)";
              ctx.fillRect(0, 0, char.imgData.width, char.imgData.height);
            }
            if (char.space) {
              $('#char' + char.index).addClass('space');
              return charset.spaceIndex = char.index;
            } else {
              return $('#char' + char.index).removeClass('space');
            }
          }));
        };
        results.push(makeClickHandler(char));
      }
      return results;
    },
    genCombos: function() {
      var char, charIndex, charIndexes, cmb, cmbArray, combo, ctx, cvs, drawCombos, i, img, imgData, j, k, len, len1, len2, m, maxWeight, minWeight, n, o, offsetX, offsetY, p, q, ref, ref1, ref2, ref3, ref4, ref5, s, weight;
      $('#comboPreview').empty();
      charset.chars = _(charset.chars).sortBy('index');
      charIndexes = [];
      ref = charset.chars;
      for (k = 0, len = ref.length; k < len; k++) {
        char = ref[k];
        if (char.selected) {
          charIndexes.push(char.index);
        }
      }
      cmb = Combinatorics.baseN(charIndexes, charset.overlaps.length);
      cmbArray = cmb.toArray();
      charset.combos = [];
      for (i = m = 0, ref1 = cmbArray.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        combo = {
          index: i,
          chars: cmbArray[i],
          weight: 0
        };
        cvs = document.createElement('canvas');
        cvs.width = charset.chars[0].imgData.width / 2;
        cvs.height = charset.chars[0].imgData.height / 2;
        ctx = cvs.getContext("2d");
        ctx.globalCompositeOperation = 'multiply';
        for (j = n = 0, ref2 = charset.overlaps.length; 0 <= ref2 ? n < ref2 : n > ref2; j = 0 <= ref2 ? ++n : --n) {
          charIndex = combo.chars[j];
          img = document.createElement("img");
          img.src = document.getElementById('char' + charIndex).toDataURL("image/png");
          offsetX = cvs.width * charset.overlaps[j][0];
          offsetY = cvs.height * charset.overlaps[j][1];
          ctx.drawImage(img, -2 * offsetX, -2 * offsetY, cvs.width * 2, cvs.height * 2);
        }
        combo.imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        charset.combos.push(combo);
      }
      ref3 = charset.combos;
      for (o = 0, len1 = ref3.length; o < len1; o++) {
        combo = ref3[o];
        imgData = combo.imgData;
        weight = 0;
        for (p = q = 0, ref4 = imgData.data.length; q < ref4; p = q += 4) {
          weight += imgData.data[p];
          weight += imgData.data[p + 1];
          weight += imgData.data[p + 2];
        }
        combo.weight = weight;
      }
      charset.combos = _(charset.combos).sortBy('weight');
      maxWeight = _.max(charset.combos, function(w) {
        return w.weight;
      }).weight;
      minWeight = _.min(charset.combos, function(w) {
        return w.weight;
      }).weight;
      ref5 = charset.combos;
      for (s = 0, len2 = ref5.length; s < len2; s++) {
        combo = ref5[s];
        combo.brightness = 255 - (255 * (combo.weight - minWeight)) / (maxWeight - minWeight);
      }
      return drawCombos = function() {
        var len3, newCanvasHtml, ref6, results, t;
        $('#comboPreview').empty();
        ref6 = charset.combos;
        results = [];
        for (t = 0, len3 = ref6.length; t < len3; t++) {
          combo = ref6[t];
          newCanvasHtml = '<canvas id="combo' + combo.index + '" width="' + combo.imgData.width + '" height="' + combo.imgData.height + '"></canvas>';
          $('#comboPreview').append(newCanvasHtml);
          cvs = document.getElementById('combo' + combo.index);
          ctx = cvs.getContext("2d");
          results.push(ctx.putImageData(combo.imgData, 0, 0));
        }
        return results;
      };
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
    dither = true;
    gr = greyscale(source);
    combosArray = [];
    ref = [source.height, source.width], h = ref[0], w = ref[1];
    for (i = k = 0, ref1 = h; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
      row = '';
      for (j = m = 0, ref2 = w; 0 <= ref2 ? m < ref2 : m > ref2; j = 0 <= ref2 ? ++m : --m) {
        b = gr[i * w + j];
        closest = null;
        ref3 = window.weights;
        for (n = 0, len = ref3.length; n < len; n++) {
          c = ref3[n];
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
        row += closest.character;
      }
      text += escapeHtml(row) + '<br />';
    }
    return $('#output_ascii').html(text);
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
      greyArray.push(l);
    }
    return greyArray;
  };

  inputImage = {
    dropImage: function(source) {
      var loadImage, render;
      render = function(src) {
        var image;
        image = new Image();
        image.onload = function() {
          var aspectRatio, canvas, charAspect, ctx, rowLength;
          rowLength = 80;
          canvas = document.getElementById('inputImage');
          ctx = canvas.getContext("2d");
          aspectRatio = image.height / image.width;
          charAspect = charset.chars[0].imgData.height / charset.chars[0].imgData.width;
          canvas.width = rowLength * 2;
          canvas.height = rowLength * aspectRatio * 2 * charAspect;
          return ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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
    console.log('chop character set');
    charset.getSettings();
    charset.chopPreview();
    charset.chopCharset();
    return charset.drawCharSelect();
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
