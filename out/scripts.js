(function() {
  var MAX_HEIGHT, char, charCombo, charSet, charSetFn, charSets, loadImage, overlap, render, reverseCharCombo, target;

  charSets = [];

  charSet = {
    name: "Untitled Character Set",
    img: [],
    options: {
      keystone: {
        topLeft: [0, 0],
        topRight: [1, 0],
        bottomLeft: [0, 1],
        bottomRight: [1, 1]
      },
      measurements: {
        width: 200,
        height: 200,
        numCols: 70,
        numRows: 20
      },
      crop: {
        cropStart: [0, 0],
        cropEnd: [1, 1],
        charWidth: 0,
        charHeight: 0,
        gridOffset: [-.5, -.5]
      },
      weigh: {
        increaseContrast: true,
        subpixelsX: 1,
        subpixelsY: 1,
        renderHeight: 50
      },
      overlap: {
        padding: [0, 0],
        paddingOn: false,
        reverseX: false,
        reverseY: false
      }
    },
    overlaps: [],
    croppedImg: [],
    chars: [],
    charCombos: [],
    reverseCharCombos: []
  };

  overlap = {
    offset: [.5, .5],
    calcDown: true,
    calcRight: true,
    lightenDown: .5,
    lightenRight: .5,
    overlapOn: false
  };

  char = {
    img: [],
    weights: [],
    selected: true
  };

  charCombo = {
    charIndex: 0,
    charOverlapIndex: [],
    img: [],
    weights: [],
    selected: true
  };

  reverseCharCombo = {
    charIndex: 0,
    charOverlapIndex: [],
    img: [],
    weights: [],
    selected: true
  };

  charSetFn = {
    keystone: function(img, keystonePoints) {
      var c, ctx;
      c = document.getElementById('myCanvas');
      ctx = c.getContext('2d');
      ctx.getImageData(0, 0, c.width, c.height);
      ctx.transform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(image, 0, 0, c.width, c.height);
      return img;
    },
    chopImg: function(img, rows, cols, start, end) {
      var chars, currentCol, currentRow;
      chars = [];
      currentRow = start[1];
      while (currentRow <= end[1]) {
        currentCol = start[0];
        while (currentCol <= end[0]) {
          char = {};
          char.id = [currentCol, currentRow];
          char.img = [];
          chars.append(char);
          currentCol++;
        }
        currentRow++;
      }
      return chars;
    },
    generateCombos: function(chars, layers) {
      var a, b, c, combo, combos, emptyCombo, i, j, n, numCombos, ref, ref1;
      numCombos = Math.pow(chars.length, layers.length);
      emptyCombo = (function() {
        var i, ref, results;
        results = [];
        for (n = i = 0, ref = layers.length; 0 <= ref ? i < ref : i > ref; n = 0 <= ref ? ++i : --i) {
          results.push([]);
        }
        return results;
      })();
      combos = (function() {
        var i, ref, results;
        results = [];
        for (n = i = 0, ref = numCombos; 0 <= ref ? i < ref : i > ref; n = 0 <= ref ? ++i : --i) {
          results.push(emptyCombo);
        }
        return results;
      })();
      for (a = i = 0, ref = numCombos; 0 <= ref ? i < ref : i > ref; a = 0 <= ref ? ++i : --i) {
        combo = combos[a];
        for (b = j = 0, ref1 = layers.length; 0 <= ref1 ? j < ref1 : j > ref1; b = 0 <= ref1 ? ++j : --j) {
          c = layers.length - b - 1;
          combo[b] = chars[Math.floor(a / Math.pow(chars.length, c)) % chars.length];
        }
        combos.append(combo);
      }
      return combos;
    }
  };

  MAX_HEIGHT = 4000;

  render = function(src) {
    var image;
    image = new Image;
    image.onload = function() {
      var canvas, ctx;
      canvas = document.getElementById('myCanvas');
      if (image.height > MAX_HEIGHT) {
        image.width *= MAX_HEIGHT / image.height;
        image.height = MAX_HEIGHT;
      }
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
    };
    reader.readAsDataURL(src);
  };

  target = document.getElementById('drop-target');

  target.addEventListener('dragover', (function(e) {
    e.preventDefault();
  }), true);

  target.addEventListener('drop', (function(e) {
    e.preventDefault();
    loadImage(e.dataTransfer.files[0]);
  }), true);

  $("#keystone1").draggable();

  $("#keystone2").draggable();

  $("#keystone3").draggable();

  $("#keystone4").draggable();

}).call(this);
