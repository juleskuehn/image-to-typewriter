
charset =

	previewCanvas: document.getElementById('charsetPreview') # onscreen display of charset (keystoned and cropped)
	overlayCanvas: document.getElementById('charsetOverlay') # onscreen display of chopping grid / selected chars
	workingCanvas: document.createElement('canvas') # in memory canvas for hi-res operations

	settings: # defined by user input from onscreen
		gridSize: [20,20] # [x,y] number of columns,rows in between (not including) keystones
		offset: [] # [x,y] multiples of character size to offset right and down, compensates for keystone centers
		start: [] # [x,y] position on grid of the top left character in the desired charset, in [column,row] (start from 0)
		end: [] # [x,y] position on grid of the bottom right character in the desired charset, in [column,row] (start from 0)

	chars: [] # array of individual objects

	combos: [] # array of character combo objects

	# quadrant width and height in px
	qWidth: 0
	qHeight: 0




	getSettings: ->
		formValues = {}

		for formField in ['rows','cols','rowStart','rowEnd','colStart','colEnd','offsetX','offsetY']
			formValues[formField] = document.getElementById(formField).value

		charset.settings.gridSize = [(formValues.cols/1)+1,(formValues.rows/1)+1]
		charset.settings.offset = [formValues.offsetX,formValues.offsetY]
		charset.settings.start = [formValues.colStart,formValues.rowStart]
		charset.settings.end = [formValues.colEnd,formValues.rowEnd]







	# previews chop grid settings on an overlay canvas
	chopPreview: -> 
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
			newWidth = Math.ceil((charset.workingCanvas.width/(charset.settings.gridSize[0])/4)) * charset.settings.gridSize[0] * 4
			newHeight = Math.ceil((charset.workingCanvas.height/(charset.settings.gridSize[1])/4)) * charset.settings.gridSize[1] * 4

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

		charset.qWidth = charWidth/2
		charset.qHeight = charHeight/2

		# loop through characters push new char objects to the chars array
		for row in [0..numRows]
			for col in [0..numCols]
				# top left corner location of character glyph in the charset working image
				startChar = [start[0]+charWidth*col,start[1]+charHeight*row]
				# image data for quadrants
				TL = ctx.getImageData( \
					Math.floor(startChar[0]), Math.floor(startChar[1]), \
					Math.floor(charset.qWidth), Math.floor(charset.qHeight) )
				TR = ctx.getImageData Math.floor(startChar[0]+charWidth/2),Math.floor(startChar[1]),Math.floor(charWidth),Math.floor(charHeight/2)
				BL = ctx.getImageData( \
					Math.floor(startChar[0]), Math.floor(startChar[1]+charset.qHeight), \
					Math.floor(charset.qWidth), Math.floor(charset.qHeight*2) )
				BR = ctx.getImageData( \
					Math.floor(startChar[0]+charset.qWidth), Math.floor(startChar[1]+charset.qHeight), \
					Math.floor(charset.qWidth*2), Math.floor(charset.qHeight*2) )
				charset.chars.push new Char(TL,TR,BL,BR)

		# sort chars array by char.brightness
		charset.chars = _(charset.chars).sortBy('brightness')

		# invert and nomalize brightness
		maxBright = _.max(charset.chars,(w) -> w.brightness).brightness
		minBright = _.min(charset.chars,(w) -> w.brightness).brightness
		for char in charset.chars
			char.brightness = 255 - (255*(char.brightness-minBright))/(maxBright-minBright)








	drawCharSelect: ->
		$('#viewSelect').empty()
		for i in [0...charset.chars.length]
			char = charset.chars[i]
			# create canvas
			newCanvasHtml = '<canvas id="char'+i+'" width="'+charset.qWidth*2+'" height="'+charset.qHeight*2+'"></canvas>'
			$('#viewSelect').append newCanvasHtml
			cvs = document.getElementById('char'+i)
			ctx = cvs.getContext("2d")

			# draw 4 quadrants of char

			drawChar = (char,ctx) ->
				# redraw 4 quadrants
				ctx.putImageData(char.TL,0,0)
				ctx.putImageData(char.TR,charset.qWidth,0)
				ctx.putImageData(char.BL,0,charset.qHeight)
				ctx.putImageData(char.BR,charset.qWidth,charset.qHeight)
				
				if ! char.selected
					ctx.fillStyle = "rgba(0,0,0,0.5)"
					ctx.fillRect(0, 0, charset.qWidth*2, charset.qHeight*2)

			drawChar(char,ctx)



			makeClickHandler = (char,ctx) ->
				$('#char'+i).click ( (e) ->
					char.selected = !char.selected
					# redraw greyed out if unselected
					ctx.clearRect(0, 0, charset.qWidth*2, charset.qHeight*2)

					drawChar(char,ctx)

				)

			makeClickHandler(char,ctx)

			










	genCombos: ->

		# clear combo preview
		$('#comboPreview').empty()

		# Generate array of combo objects
		# Indices correspond to the indices of the 
		# chars composing the combo [TL][TR][BL][BR]
		combos = []

		# restrict to selected characters
		selected = [] 
		for c in charset.chars
			if c.selected
				selected.push(c)

		# Generate all possible combos
		for a in [0...selected.length]
			combos.push []
			for b in [0...selected.length]
				combos[a].push []
				for c in [0...selected.length]
					combos[a][b].push []
					for d in [0...selected.length]
						combos[a][b][c].push new Combo(a,b,c,d,charset);

		charset.combos = combos

		minBright = 255 # implausibly bright for a minimum
		maxBright = 0   # implausibly dark for a maximum

		# find min and max brightness
		for a in [0...selected.length]
			for b in [0...selected.length]
				for c in [0...selected.length]
					for d in [0...selected.length]
						bright = charset.combos[a][b][c][d].brightness
						if bright>maxBright
							maxBright = bright
						if bright<minBright
							minBright = bright

		# normalize and invert brightness
		for a in [0...selected.length]
			for b in [0...selected.length]
				for c in [0...selected.length]
					for d in [0...selected.length]
						combo = charset.combos[a][b][c][d]
						combo.brightness = 255 - (255*(combo.brightness-minBright))/(maxBright-minBright)

		# debugging
		window.combos = combos

		drawCombos = ->
			$('#comboPreview').empty()
			id = 0
			for a in [0...selected.length]
				for b in [0...selected.length]
					for c in [0...selected.length]
						for d in [0...selected.length]
							# create canvas
							newCanvasHtml = '<canvas id="combo'+id+'" width="'+charset.qWidth+'" height="'+charset.qWidth+'"></canvas>'
							$('#comboPreview').append newCanvasHtml
							cvs = document.getElementById('combo'+id)
							ctx = cvs.getContext("2d")
							ctx.putImageData(charset.combos[a][b][c][d].image,0,0)
							id++

		drawCombos()








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
	dither = document.getElementById('dithering').checked
	gr = greyscale(source)
	combosArray = [] # store combo indexes here to be rendered on a canvas block by block
	[h,w] = [source.height,source.width]
	for i in [0...h]
		row = []
		for j in [0...w]
			b = gr[i*w + j] # brightness value of input image pixel
			# find closest ascii brightness value
			closest = null
			for c in charset.combos
				# characters above first row must be blank
				# 0 is the index of the lightest character (blank)
				if i is 0 and (c.chars[0] != 0 or c.chars[1] != 0) 
					continue
				# characters to the left of first col must be blank
				if j is 0 and (c.chars[2] != 0 or c.chars[3] != 0)
					continue
				# characters below last row must be blank
				if i is h-1 and (c.chars[2] != 0 or c.chars[3] != 0) 
					continue
				# characters to the right of last col must be blank
				if j is w-1 and (c.chars[2] != 0 or c.chars[3] != 0)
					continue
				# otherwise, characters to the top left, right, bottom left must match
				# ...
				# ...
				# ...
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
				charAspect = charset.chars[0].TL.width/charset.chars[0].TL.height
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