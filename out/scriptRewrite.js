(function() {
  var charset, target;

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
    getSettings: function() {
      var formField, formValues, j, len, ref;
      formValues = {};
      ref = ['rows', 'cols', 'rowStart', 'rowEnd', 'colStart', 'colEnd', 'offsetX', 'offsetY'];
      for (j = 0, len = ref.length; j < len; j++) {
        formField = ref[j];
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
        var col, j, k, numCols, numRows, ref, ref1, results, row;
        numRows = charset.settings.end[1] - charset.settings.start[1];
        numCols = charset.settings.end[0] - charset.settings.start[0];
        for (row = j = 0, ref = numRows + 1; 0 <= ref ? j <= ref : j >= ref; row = 0 <= ref ? ++j : --j) {
          ctx.beginPath();
          ctx.moveTo(start[0], start[1] + row * charHeight);
          ctx.lineTo(end[0] + offsetX, start[1] + row * charHeight);
          ctx.strokeStyle = "rgba(255,0,0,0.5)";
          ctx.stroke();
        }
        results = [];
        for (col = k = 0, ref1 = numCols + 1; 0 <= ref1 ? k <= ref1 : k >= ref1; col = 0 <= ref1 ? ++k : --k) {
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
      var char, charHeight, charWidth, col, ctx, i, imgData, j, k, l, len, m, maxWeight, minWeight, numCols, numRows, offsetX, offsetY, p, ref, ref1, ref2, ref3, resizeCanvasToMultiplesOfCharSize, results, row, start, startChar, weight;
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
      for (row = j = 0, ref = numRows; 0 <= ref ? j <= ref : j >= ref; row = 0 <= ref ? ++j : --j) {
        for (col = k = 0, ref1 = numCols; 0 <= ref1 ? k <= ref1 : k >= ref1; col = 0 <= ref1 ? ++k : --k) {
          startChar = [start[0] + charWidth * col, start[1] + charHeight * row];
          imgData = ctx.getImageData(Math.floor(startChar[0]), Math.floor(startChar[1]), Math.floor(charWidth), Math.floor(charHeight));
          weight = 0;
          for (p = l = 0, ref2 = imgData.data.length; l < ref2; p = l += 4) {
            weight += imgData.data[p];
            weight += imgData.data[p + 1];
            weight += imgData.data[p + 2];
          }
          char = {
            imgData: imgData,
            weight: weight,
            selected: true,
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
      for (m = 0, len = ref3.length; m < len; m++) {
        char = ref3[m];
        results.push(char.brightness = 255 - (255 * (char.weight - minWeight)) / (maxWeight - minWeight));
      }
      return results;
    },
    drawCharSelect: function() {
      var char, ctx, cvs, j, len, makeClickHandler, newCanvasHtml, ref, results;
      $('#viewSelect').empty();
      ref = charset.chars;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        char = ref[j];
        newCanvasHtml = '<canvas id="char' + char.index + '" width="' + char.imgData.width + '" height="' + char.imgData.height + '"></canvas>';
        $('#viewSelect').append(newCanvasHtml);
        cvs = document.getElementById('char' + char.index);
        ctx = cvs.getContext("2d");
        ctx.putImageData(char.imgData, 0, 0);
        makeClickHandler = function(char) {
          return $('#char' + char.index).click(function() {
            cvs = document.getElementById('char' + char.index);
            ctx = cvs.getContext("2d");
            char.selected = !char.selected;
            ctx.clearRect(0, 0, char.imgData.width, char.imgData.height);
            if (!char.selected) {
              ctx.putImageData(char.imgData, 0, 0);
              ctx.fillStyle = "rgba(0,0,0,0.5)";
              return ctx.fillRect(0, 0, char.imgData.width, char.imgData.height);
            } else {
              return ctx.putImageData(char.imgData, 0, 0);
            }
          });
        };
        results.push(makeClickHandler(char));
      }
      return results;
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

  $('#chopCharset').click(function() {
    console.log('chop character set');
    charset.getSettings();
    charset.chopPreview();
    charset.chopCharset();
    return charset.drawCharSelect();
  });

  target = document.getElementById('drop-target');

  target.addEventListener('dragover', (function(e) {
    e.preventDefault();
  }), true);

  target.addEventListener('drop', (function(e) {
    e.preventDefault();
    charset.dropImage(e.dataTransfer.files[0]);
  }), true);

}).call(this);
