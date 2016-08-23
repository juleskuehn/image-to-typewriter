combosArray = [] # store combo indexes here to be rendered on a canvas block by block

charset =

	previewCanvas: document.getElementById('charsetPreview') # onscreen display of charset (keystoned and cropped)
	overlayCanvas: document.getElementById('charsetOverlay') # onscreen display of chopping grid / selected chars
	workingCanvas: document.createElement('canvas') # in memory canvas for hi-res operations

	settings: # defined by user input from onscreen
		keystones: [ [],[],[],[] ] # four [x,y] positions indicating centers of 4 keystone points on charset preview
		gridSize: [20,20] # [x,y] number of columns,rows in between (not including) keystones
		offset: [] # [x,y] multiples of character size to offset right and down, compensates for keystone centers
		start: [] # [x,y] position on grid of the top left character in the desired charset, in [column,row] (start from 0)
		end: [] # [x,y] position on grid of the bottom right character in the desired charset, in [column,row] (start from 0)

	chars: [] # array of individual objects

	combos: [] # array of character combo objects

	overlaps: [ [0,0],[0,0.5],[0.5,0] ] # array of offset values for each overlap (TESTING: preset to 2 layers)

	getSettings: ->
		formValues = {}

		for formField in ['rows','cols','rowStart','rowEnd','colStart','colEnd','offsetX','offsetY']
			formValues[formField] = document.getElementById(formField).value

		charset.settings.gridSize = [(formValues.cols/1)+1,(formValues.rows/1)+1]
		charset.settings.offset = [formValues.offsetX,formValues.offsetY]
		charset.settings.start = [formValues.colStart,formValues.rowStart]
		charset.settings.end = [formValues.colEnd,formValues.rowEnd]

		#for i in [1..charset.overlaps.length]
		#	offsetX = document.getElementById('o'+i+'offsetX').value
		#	offsetY = document.getElementById('o'+i+'offsetY').value
		#	charset.overlaps[i] = [offsetX,offsetY]

	# TODO: skipping keystoning for now
	chopPreview: -> # previews chop grid settings on an overlay canvas
		ctx = charset.overlayCanvas.getContext('2d')

		charWidth = charset.overlayCanvas.width / charset.settings.gridSize[0]
		charHeight = charset.overlayCanvas.height / charset.settings.gridSize[1]
		offsetX = charWidth * charset.settings.offset[0]
		offsetY = charHeight * charset.settings.offset[1]

		start = [charset.settings.start[0]*charWidth+offsetX,charset.settings.start[1]*charHeight+offsetY]
		end = [charset.settings.end[0]*charWidth+2*offsetX,charset.settings.end[1]*charHeight+2*offsetY]

		lightboxSelection = ->
			ctx.clearRect(0, 0, charset.overlayCanvas.width, charset.overlayCanvas.height)
			ctx.fillStyle = "rgba(0,0,0,0.75)"
			ctx.fillRect(0, 0, charset.overlayCanvas.width, charset.overlayCanvas.height)
			console.log ' start = ' + start
			console.log ' end = ' + end
			ctx.clearRect(start[0],start[1],end[0]-start[0]+offsetX,end[1]-start[1]+offsetY)

		lightboxSelection()

		drawGrid = ->
			numRows = (charset.settings.end[1] - charset.settings.start[1])
			numCols = (charset.settings.end[0] - charset.settings.start[0])
			for row in [0..numRows+1]
				# horizontal lines
				ctx.beginPath();
				ctx.moveTo(start[0],start[1]+row*charHeight);
				ctx.lineTo(end[0]+offsetX,start[1]+row*charHeight);
				ctx.strokeStyle = "rgba(255,0,0,0.5)"
				ctx.stroke();
			for col in [0..numCols+1]
				# vertical lines
				ctx.beginPath();
				ctx.moveTo(start[0]+col*charWidth,start[1]);
				ctx.lineTo(start[0]+col*charWidth,end[1]+offsetY);
				ctx.strokeStyle = "rgba(255,0,0,0.5)"
				ctx.stroke();

		drawGrid()

	chopCharset: ->
		# resize workingCanvas to nearest multiple of rows, cols and redraw
		resizeCanvasToMultiplesOfCharSize = ->
			wCanvas = charset.workingCanvas
			tempCanvas = document.createElement('canvas')
			tempCanvas.width = wCanvas.width
			tempCanvas.height = wCanvas.height

			# save workingCanvas into tempCanvas
			tempCanvas.getContext('2d').drawImage(wCanvas, 0, 0);

			# get closest multiple
			newWidth = Math.ceil(charset.workingCanvas.width / charset.settings.gridSize[0]) * charset.settings.gridSize[0]
			newHeight = Math.ceil(charset.workingCanvas.height / charset.settings.gridSize[1]) * charset.settings.gridSize[1]

			# resize workingCanvas
			wCanvas.width = newWidth
			wCanvas.height = newHeight

			# draw tempCanvas back into workingCanvas, scaled as needed
			wCanvas.getContext('2d').drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, wCanvas.width, wCanvas.height)

		resizeCanvasToMultiplesOfCharSize()

		charset.chars = []
		ctx = charset.workingCanvas.getContext('2d')
		charWidth = charset.workingCanvas.width / charset.settings.gridSize[0]
		charHeight = charset.workingCanvas.height / charset.settings.gridSize[1]
		offsetX = charWidth * charset.settings.offset[0]
		offsetY = charHeight * charset.settings.offset[1]
		start = [charset.settings.start[0]*charWidth+offsetX,charset.settings.start[1]*charHeight+offsetY]
		numRows = (charset.settings.end[1] - charset.settings.start[1])
		numCols = (charset.settings.end[0] - charset.settings.start[0])

		i = 0
		for row in [0..numRows]
			for col in [0..numCols]
				startChar = [start[0]+charWidth*col,start[1]+charHeight*row]
				imgData = ctx.getImageData Math.floor(startChar[0]),Math.floor(startChar[1]),Math.floor(charWidth),Math.floor(charHeight)
				weight = 0 # quick weighing
				# generate weights
				for p in [0...imgData.data.length] by 4
					weight += imgData.data[p]
					weight += imgData.data[p+1]
					weight += imgData.data[p+2]
				char =
					imgData: imgData
					weight: weight
					selected: true
					space: false
					index: i
				charset.chars.push char
				i++

		# normalize weights
		charset.chars = _(charset.chars).sortBy('weight')
		maxWeight = _.max(charset.chars,(w) -> w.weight).weight
		minWeight = _.min(charset.chars,(w) -> w.weight).weight
		for char in charset.chars
			char.brightness = 255 - (255*(char.weight-minWeight))/(maxWeight-minWeight)

	drawCharSelect: ->
		$('#viewSelect').empty()
		for char in charset.chars
			# create canvas
			newCanvasHtml = '<canvas id="char'+char.index+'" width="'+char.imgData.width+'" height="'+char.imgData.height+'"></canvas>'
			$('#viewSelect').append newCanvasHtml
			cvs = document.getElementById('char'+char.index)
			ctx = cvs.getContext("2d")
			ctx.putImageData(char.imgData,0,0)
			
			makeClickHandler = (char) ->
				$('#char'+char.index).click ( (e) ->
					cvs = document.getElementById('char'+char.index)
					ctx = cvs.getContext("2d")
					if e.ctrlKey
						char.space = !char.space
					else
						char.selected = !char.selected
					# redraw greyed out if unselected
					ctx.clearRect(0, 0, char.imgData.width, char.imgData.height)
					ctx.putImageData(char.imgData,0,0)
					if ! char.selected
						ctx.fillStyle = "rgba(0,0,0,0.5)"
						ctx.fillRect(0, 0, char.imgData.width, char.imgData.height)
					if char.space
						$('#char'+char.index).addClass('space')
						charset.spaceIndex = char.index # BUG only the last selected space will work. only select 1 space
					else
						$('#char'+char.index).removeClass('space')
				)

			makeClickHandler(char)

	genCombos: ->

		# clear combo preview
		$('#comboPreview').empty()
		# sort charset.chars by indexes again
		charset.chars = _(charset.chars).sortBy('index')

		# iterate through characters generating array of indexes only
		charIndexes = []
		for char in charset.chars
			if char.selected
				charIndexes.push char.index

		# generate combinations of charIndexes
		cmb = Combinatorics.baseN(charIndexes,charset.overlaps.length)
		cmbArray = cmb.toArray()

		# create combo objects and weigh
		charset.combos = []
		for i in [0...cmbArray.length]

			combo =
				index: i
				chars: cmbArray[i]
				weight: 0

			# generate composite image
			cvs = document.createElement('canvas')
			cvs.width = charset.chars[0].imgData.width/2
			cvs.height = charset.chars[0].imgData.height/2
			ctx = cvs.getContext("2d")
			ctx.globalCompositeOperation = 'multiply';
			for j in [0...charset.overlaps.length]
				charIndex = combo.chars[j]
				img = document.createElement("img");
				img.src = document.getElementById('char'+charIndex).toDataURL("image/png")
				offsetX = cvs.width * charset.overlaps[j][0]
				offsetY = cvs.height * charset.overlaps[j][1]
				ctx.drawImage(img,-2*offsetX,-2*offsetY,cvs.width*2,cvs.height*2)
			combo.imgData = ctx.getImageData 0,0,cvs.width,cvs.height

			charset.combos.push combo

		for combo in charset.combos
			imgData = combo.imgData
			weight = 0 # quick weighing
			# generate weights
			for p in [0...imgData.data.length] by 4
				weight += imgData.data[p]
				weight += imgData.data[p+1]
				weight += imgData.data[p+2]
			combo.weight = weight

		# normalize weights
		charset.combos = _(charset.combos).sortBy('weight')
		maxWeight = _.max(charset.combos,(w) -> w.weight).weight
		minWeight = _.min(charset.combos,(w) -> w.weight).weight
		for combo in charset.combos
			combo.brightness = 255 - (255*(combo.weight-minWeight))/(maxWeight-minWeight)

		drawCombos = ->
			$('#comboPreview').empty()
			for combo in charset.combos
				# create canvas
				newCanvasHtml = '<canvas id="combo'+combo.index+'" width="'+combo.imgData.width+'" height="'+combo.imgData.height+'"></canvas>'
				$('#comboPreview').append newCanvasHtml
				cvs = document.getElementById('combo'+combo.index)
				ctx = cvs.getContext("2d")
				ctx.putImageData(combo.imgData,0,0)

		# drawCombos()

	dropImage: (source) ->
		MAX_HEIGHT = $(window).height() - 100	

		render = (src) ->

		  image = new Image

		  image.onload = ->
		    canvas = charset.previewCanvas
		    if image.height > MAX_HEIGHT
		      image.width *= MAX_HEIGHT / image.height
		      image.height = MAX_HEIGHT
		    ctx = canvas.getContext('2d')
		    ctx.clearRect 0, 0, canvas.width, canvas.height
		    canvas.width = image.width
		    canvas.height = image.height
		    ctx.drawImage image, 0, 0, image.width, image.height
		    #resize overlay to match
		    canvas = charset.overlayCanvas
		    canvas.width = image.width
		    canvas.height = image.height
		    return

		  image.src = src
		  return

		renderWorking = (src) ->

		  image = new Image

		  image.onload = ->
		    canvas = charset.workingCanvas
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
		    renderWorking e.target.result
		    return

		  reader.readAsDataURL src
		  return

		loadImage(source)

imgToText = ->
	source = document.getElementById("inputImage")
	cvs = source.getContext('2d')
	dither = true
	gr = greyscale(source)
	combosArray = [] # store combo indexes here to be rendered on a canvas block by block
	[h,w] = [source.height,source.width]
	for i in [0...h]
		row = []
		for j in [0...w]
			b = gr[i*w + j]
			# find closest ascii brightness value
			closest = null
			for c in charset.combos
				if closest is null or Math.abs(c.brightness-b) < Math.abs(err)
					closest = c
					err = b-c.brightness
			# floyd-steinberg dithering
			if dither
				gr[i*w + j] = c.brightness
				if j+1 < w
					gr[i*w + j+1] += (err * 7/16)
				if i+1 < h and j-1 > 0
					gr[(i+1)*w + j-1] += (err * 3/16)
				if i+1 < h
					gr[(i+1)*w + j] += (err * 5/16)
				if i+1 < h and j+1 < w
					gr[(i+1)*w + j+1] += (err * 1/16)
			row.push closest.index
		combosArray.push row
	console.log combosArray
	drawCharImage()

greyscale = (canvas) ->
	greyscaleMethod = $('#bw').val()
	customR = $('#customR').val()
	customG = $('#customG').val()
	customB = $('#customB').val()
	greyArray = []
	cvs = canvas.getContext('2d')
	imgData = cvs.getImageData(0,0,canvas.width,canvas.height)
	imgData = imgData.data
	for p in [0...imgData.length] by 4
		l = 0
		if greyscaleMethod is 'ccir'
			[r,g,b] = [0.2989, 0.5870, 0.1140]
		else if greyscaleMethod is 'cie'
			[r,g,b] = [0.2126, 0.7152, 0.0722]
		else if greyscaleMethod is 'flat'
			[r,g,b] = [0.3333, 0.3333, 0.3333]
		else if greyscaleMethod is 'red'
			[r,g,b] = [1, 0, 0]
		else if greyscaleMethod is 'green'
			[r,g,b] = [0, 1, 0]
		else if greyscaleMethod is 'blue'
			[r,g,b] = [0, 0, 1]
		l += imgData[p] * r * customR * imgData[p+3] / 255 #Red
		l += imgData[p+1] * g * customG * imgData[p+3] / 255 #Green
		l += imgData[p+2] * b * customB * imgData[p+3] / 255 #Blue

		# invert pixel values
		l = 255-l
		
		greyArray.push(l)
	return greyArray

drawCharImage = ->
	charset.combos = _(charset.combos).sortBy('index')
	inCanvas = document.getElementById('inputImage')
	outCanvas = document.getElementById('outputImage')
	outCanvas.width = charset.combos[0].imgData.width * inCanvas.width
	outCanvas.height = charset.combos[0].imgData.height * inCanvas.height
	ctx = outCanvas.getContext("2d")
	for i in [0...combosArray.length]
		for j in [0...combosArray[0].length]
			console.log combosArray[i][j]
			combo = charset.combos[ combosArray[i][j] ]
			ctx.putImageData(combo.imgData,j*combo.imgData.width,i*combo.imgData.height)

inputImage =
	dropImage: (source) ->
		render = (src) ->
			image = new Image();
			image.onload = ->
				rowLength = $('#row_length').val()
				canvas = document.getElementById('inputImage')
				ctx = canvas.getContext("2d")
				aspectRatio = image.height/image.width
				charAspect = charset.chars[0].imgData.width/charset.chars[0].imgData.height
				canvas.width = rowLength*2
				canvas.height = rowLength*aspectRatio*2*charAspect
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
				# run the comparison
				imgToText()
			image.src = src

		loadImage = (src) ->
			# Prevent any non-image file type from being read.
			if !src.type.match(/image.*/)
				console.log("The dropped file is not an image: ", src.type)
				return

			# Create our FileReader and run the results through the render function.
			reader = new FileReader()
			reader.onload = (e) ->
				render e.target.result
			reader.readAsDataURL(src)

		loadImage(source)


# handle UI events

$('#chopCharset').click ->
	console.log 'chop character set'
	charset.getSettings()
	charset.chopPreview()
	charset.chopCharset()
	charset.drawCharSelect()

$('#genCombos').click ->
	charset.genCombos()

target = document.getElementById('charset-target')
target.addEventListener 'dragover', ((e) ->
  e.preventDefault()
  return
), true
target.addEventListener 'drop', ((e) ->
  e.preventDefault()
  charset.dropImage e.dataTransfer.files[0]
  return
), true

target = document.getElementById('image-target')
target.addEventListener 'dragover', ((e) ->
  e.preventDefault()
  return
), true
target.addEventListener 'drop', ((e) ->
  e.preventDefault()
  inputImage.dropImage e.dataTransfer.files[0]
  return
), true