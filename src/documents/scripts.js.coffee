charSets = [] # TODO: save multiple character sets to reuse settings later?

charSet = # TODO: should probably write this as a constructor
	name: "Untitled Character Set"
	img: [] # filled by charSetCanvas.getImageData(0,0,canvas.width,canvas.height)
	options: # information to chop charSet.img, generating chars
		keystone: # used to rotate/keystone charSet.img, reference for real-world character size
			topLeft: [0,0] # x,y. defaults select entire image (no keystone/rotate/crop)
			topRight: [1,0]
			bottomLeft: [0,1]
			bottomRight: [1,1]
		measurements: # measured distances between keystone characters, creates grid and relates size
			width: 200 # width between keystone character centers or right edges in mm
			height: 200 # height between keystone character centers or bottom edges in mm
			numCols: 70 # number of columns between keystone characters, inclusive
			numRows: 20 # number of rows between keystone characters, inclusive
		crop: # options for cropping to the set, and for individual characters. based on grid
			cropStart: [0,0] # defines top left corner of character set in [column,row]
			cropEnd: [1,1] # defines bottom right corner of character set in [column,row]
			charWidth: 0# measurements.width / (measurements.numCols - 1) [-1 to compensate for center-center measuring]
			charHeight: 0 # measurements.height / (measurements.numRows - 1)
			gridOffset: [-.5,-.5] # move grid .5 charSize up and left
		weigh:
			increaseContrast: true # increases contrast to fill full range (whitens paper, darkens ink)
			subpixelsX: 1 # subpixel value of 1 will sum darkness over entire charWidth
			subpixelsY: 1 # " for charHeight. determines resolution. low for speed, high for quality
			renderHeight: 50 # resizes char to maximum pixel size. low for speed, high for quality
		overlap:
			padding: [0,0] # x,y - based on charSize, not charSet size
			paddingOn: false # padding creates overlap
			reverseX: false # processes right to left (error on left)
			reverseY: false # processes bottom to top (error on top)
	overlaps: [] # object for each overlap
	croppedImg: [] # filled by charSetCanvasCropped.getImageData(0,0,canvas.width,canvas.height)
	chars: [] # objects for cropped characters, weight information
	charCombos: [] # generated objects for combinatons of characters, weight information
	reverseCharCombos: [] # as above but with overlap directions reversed
	
overlap = # each overlap creates a lot of combos
	offset: [.5,.5] # move overlap .5 charSize down and right
	calcDown: true # include (part of) next cell down in calculation
	calcRight: true # include (part of) next cell right in calculation
	lightenDown: .5 # weighting for next cell down favors lighter character (0-1)
	lightenRight: .5 # weighting for next cell right favors lighter character (0-1)
	overlapOn: false # enabling (re)generates charCombos. select characters first.

char =
	img: [] # chopped from croppedImg by increments of crop.charWidth, crop.charHeight
	weights: [] # 2d array of weight (darkness sum) per subpixel
	selected: true

charCombo =
	charIndex: 0 # index of main char in array charSet.chars
	charOverlapIndex: [] # array of overlap characters corresponding to charSet.overlaps index
	img: [] # created from combinations of chars above, based on overlap.offset
	weights: [] # 2d array of weight / subpixel. longer than char.weights if calcDown and calcRight
	# lighten can be calculated on the fly when comparing so don't include it in weights above
	selected: true

reverseCharCombo = # used to weigh left/top sides when a character has already been chosen
	charIndex: 0 # index of main char in array charSet.chars
	charOverlapIndex: [] # array of overlap characters corresponding to charSet.overlaps index
	img: [] # created from combinations of chars above, based on -1*overlap.offset
	weights: [] # 2d array of weight / subpixels
	# indexes of these correspond to those of charCombos
	selected: true

charSetFn = # functions for processing
	keystone: (img,keystonePoints) ->
		# takes img and array of keystone coordinates (x,y), returns cropped & keystoned image
		c = document.getElementById('myCanvas')
		ctx = c.getContext('2d')
		ctx.getImageData(0,0,c.width,c.height)
		ctx.transform 1, 0, 0, 1, 0, 0
		ctx.drawImage(image, 0, 0, c.width, c.height)
		return img
	chopImg: (img,rows,cols,start,end) ->
		# takes keystoned img and chopping details, returns array of character objects
		chars = []
		# loop through section
		currentRow = start[1]
		while currentRow <= end[1]
			currentCol = start[0]
			while currentCol <= end[0]
				# perform cropping action and create character object
				char = {}
				char.id = [currentCol,currentRow]
				char.img = [] # fill with cropped section of keystoned image
				chars.append char
				currentCol++
			currentRow++
		return chars
	generateCombos: (chars,layers) ->
		numCombos = chars.length**layers.length
		emptyCombo = ([] for n in [0...layers.length]) # empty array corresponding to layers
		combos = (emptyCombo for n in [0...numCombos]) # empty 2d array of empty combos as above
		for a in [0...numCombos] # loop through every combo
			combo = combos[a]
			for b in [0...layers.length] # loop through every layer for each combo
				# assign every combination
				c = layers.length - b - 1 # so that it increments right to left (arabic numbers)
				combo[b]=chars[Math.floor(a/chars.length**c)%chars.length]
			combos.append combo
		return combos

MAX_HEIGHT = 4000

render = (src) ->
  image = new Image

  image.onload = ->
    canvas = document.getElementById('myCanvas')
    if image.height > MAX_HEIGHT
      image.width *= MAX_HEIGHT / image.height
      image.height = MAX_HEIGHT
    ctx = canvas.getContext('2d')
    ctx.clearRect 0, 0, canvas.width, canvas.height
    canvas.width = image.width
    canvas.height = image.height
    ctx.drawImage image, 0, 0, image.width, image.height
    return

  image.src = src
  return

loadImage = (src) ->
  #	Prevent any non-image file type from being read.
  if !src.type.match(/image.*/)
    console.log 'The dropped file is not an image: ', src.type
    return
  #	Create our FileReader and run the results through the render function.
  reader = new FileReader

  reader.onload = (e) ->
    render e.target.result
    return

  reader.readAsDataURL src
  return

target = document.getElementById('drop-target')
target.addEventListener 'dragover', ((e) ->
  e.preventDefault()
  return
), true
target.addEventListener 'drop', ((e) ->
  e.preventDefault()
  loadImage e.dataTransfer.files[0]
  return
), true

$("#keystone1").draggable()
$("#keystone2").draggable()
$("#keystone3").draggable()
$("#keystone4").draggable()