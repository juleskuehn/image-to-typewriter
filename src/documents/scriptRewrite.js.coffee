
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

		# TODO fix this
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
				TR = ctx.getImageData( \
					Math.floor(startChar[0]+charWidth/2),Math.floor(startChar[1]), \
					Math.floor(charset.qWidth), Math.floor(charset.qHeight) )
				BL = ctx.getImageData( \
					Math.floor(startChar[0]), Math.floor(startChar[1]+charset.qHeight), \
					Math.floor(charset.qWidth), Math.floor(charset.qHeight) )
				BR = ctx.getImageData( \
					Math.floor(startChar[0]+charset.qWidth), Math.floor(startChar[1]+charset.qHeight), \
					Math.floor(charset.qWidth), Math.floor(charset.qHeight) )
				charset.chars.push new Char(TL,TR,BL,BR)

		# invert and nomalize brightness
		
		maxBright = _.max(charset.chars,(w) -> w.brightness).brightness
		minBright = _.min(charset.chars,(w) -> w.brightness).brightness
		for char in charset.chars
			char.brightness = 255 - (255*(char.brightness-minBright))/(maxBright-minBright)

		# sort chars array by char.brightness
		charset.chars = _(charset.chars).sortBy('brightness')

		# now create indexes to correlate with combo objects
		for i in [0...charset.chars.length]
			charset.chars[i].index = i

		console.log charset.chars
			
		# do not change character indexes after this!



	drawCharQuadrants: ->
		$('#charQuadrants').empty()
		for i in [0...charset.chars.length]
			char = charset.chars[i]

			drawQuadrant = (quadrant,quadrantString) ->
				# create canvas
				newCanvasHtml = '<canvas id="char'+quadrantString+i+'" width="'+charset.qWidth+'" height="'+charset.qHeight+'"></canvas>'
				$('#charQuadrants').append newCanvasHtml
				cvs = document.getElementById('char'+quadrantString+i)
				ctx = cvs.getContext("2d")

				ctx.putImageData(quadrant,0,0)

			drawQuadrant(char.TL,"TL")
			drawQuadrant(char.TR,"TR")
			drawQuadrant(char.BL,"BL")
			drawQuadrant(char.BR,"BR")


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
						combos[a][b][c].push new Combo(a,b,c,d,charset,selected);

		charset.combos = combos

		minBright = 100000000 # implausibly bright for a minimum
		maxBright = 0   # implausibly dark for a maximum

		# find min and max brightness for each quadrant of the quadrant!
		for a in [0...selected.length]
			for b in [0...selected.length]
				for c in [0...selected.length]
					for d in [0...selected.length]
						bright = charset.combos[a][b][c][d].TLbrightness
						if bright>maxBright
							maxBright = bright
						if bright<minBright
							minBright = bright
						bright = charset.combos[a][b][c][d].TRbrightness
						if bright>maxBright
							maxBright = bright
						if bright<minBright
							minBright = bright
						bright = charset.combos[a][b][c][d].BLbrightness
						if bright>maxBright
							maxBright = bright
						if bright<minBright
							minBright = bright
						bright = charset.combos[a][b][c][d].BRbrightness
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
						combo.TLbrightness = 255 - (255*(combo.TLbrightness-minBright))/(maxBright-minBright)
						combo.TRbrightness = 255 - (255*(combo.TRbrightness-minBright))/(maxBright-minBright)
						combo.BLbrightness = 255 - (255*(combo.BLbrightness-minBright))/(maxBright-minBright)
						combo.BRbrightness = 255 - (255*(combo.BRbrightness-minBright))/(maxBright-minBright)

		console.log combos



		drawCombos = ->
			# remove existing combo images from DOM
			$('#comboPreview').empty()

			# store all combos to be drawn in this 1d array (for sorting)
			sortedCombos = []
			
			for a in [0...selected.length]
				for b in [0...selected.length]
					for c in [0...selected.length]
						for d in [0...selected.length]
							# add to new output array 
							sortedCombos.push charset.combos[a][b][c][d]


			# sort the combos
			sortedCombos = _(sortedCombos).sortBy('brightness')

			# create a unique DOM element for each combo image
			# TODO this is slow... should reduce # of dom accesses
			id = 0
			for combo in sortedCombos
				# create canvas
				newCanvasHtml = '<canvas id="combo'+id+'" width="'+charset.qWidth+'" height="'+charset.qHeight+'"></canvas>'
				$('#comboPreview').append newCanvasHtml
				cvs = document.getElementById('combo'+id)
				ctx = cvs.getContext("2d")
				ctx.putImageData(combo.image,0,0)
				id++

		drawCombos()

		charset.selected = selected

		console.log charset.selected






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



# this will be populated as a 2d array (rows, cols) of charset.selected indices
combosArray = []
bestCombos = []

imgToText = ->
	source = document.getElementById("inputImage")
	cvs = source.getContext('2d')
	dither = document.getElementById('dithering').checked
	gr = greyscale(source)
	[h,w] = [source.height,source.width]
	# looping through input image array in 2x2 pixel increments
	for i in [0...h] by 2
		row = []
		comboRow = []
		for j in [0...w] by 2
			# weigh subpixels of input image
			bTL = gr[i*w + j] # brightness value of input image subpixel
			bTR = gr[i*w + j+1] # brightness value of input image subpixel
			bBL = gr[(i+1)*w + j] # brightness value of input image subpixel
			bBR = gr[(i+1)*w + j+1] # brightness value of input image subpixel
			
			# establish constraints on character selection
			# TODO
			TL=TR=BL=0
			if i>0 and j>0
				TL=combosArray[i/2-1][j/2-1]
			if i>0
				TR=combosArray[i/2-1][j/2]
			if j>0
				BL=row[row.length-1]
			

			# find closest ascii brightness value
			# closest is the index in charset.selected of the best char choice
			closest = -1
			bestErr = 0
			bestCombo = null

			# loop through appropriate subsection of combos and weigh each subpixel against the input image
			for k in [0...charset.combos[TL][TR][BL].length]
				combo = charset.combos[TL][TR][BL][k]
				# check each subpixel against input image
				errTL = bTL-combo.TLbrightness
				errTR = bTR-combo.TRbrightness
				errBL = bBL-combo.BLbrightness
				errBR = bBR-combo.BRbrightness
				errTot = -(errTL+errTR+errBL+errBR)/16

				if closest is -1 or Math.abs(errTot) < Math.abs(bestErr)
					bestErr = errTot
					closest = k
					bestCombo = combo
			
			# floyd-steinberg dithering
			# macro dithering - whole quadrants (not subpixels)
			if dither
				# distribute error to the right
				if j+1 < w
					gr[i*w + j+2] += (errTot * 7/16)
					gr[i*w + j+3] += (errTot * 7/16)
					gr[(i+1)*w + j+2] += (errTot * 7/16)
					gr[(i+1)*w + j+3] += (errTot * 7/16)
				# distribute error to the bottom left
				if i+1 < h and j-1 > 0
					gr[(i+2)*w + j-1] += (errTot * 3/16)
					gr[(i+2)*w + j-2] += (errTot * 3/16)
					gr[(i+3)*w + j-1] += (errTot * 3/16)
					gr[(i+3)*w + j-2] += (errTot * 3/16)
				# distribute error to the bottom
				if i+1 < h
					gr[(i+2)*w + j] += (errTot * 5/16)
					gr[(i+2)*w + j+1] += (errTot * 5/16)
					gr[(i+3)*w + j] += (errTot * 5/16)
					gr[(i+3)*w + j+1] += (errTot * 5/16)
				# distribute error to the bottom right
				if i+1 < h and j+1 < w
					gr[(i+2)*w + j+1] += (errTot * 1/16)
					gr[(i+2)*w + j+2] += (errTot * 1/16)
					gr[(i+3)*w + j+1] += (errTot * 1/16)
					gr[(i+3)*w + j+2] += (errTot * 1/16)
			
			row.push closest
			comboRow.push bestCombo
		combosArray.push row
		bestCombos.push comboRow

	console.log combosArray
	drawCharImage()

drawCharImage = ->
	
	
	inCanvas = document.getElementById('inputImage')
	outCanvas = document.getElementById('outputImage')
	# the input image will have been resized to (cols,rows)*2*2 (quadrant,subpixel)
	outCanvas.width = charset.qWidth * inCanvas.width / 2
	outCanvas.height = charset.qHeight * inCanvas.height / 2
	ctx = outCanvas.getContext("2d")
	for i in [0...bestCombos.length]
		for j in [0...bestCombos[0].length]
			combo = bestCombos[i][j]
			# print combo image
			# TODO print actual characters
			ctx.putImageData(combo.image,j*charset.qWidth,i*charset.qHeight)



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
				# multiplier of 4 accounts for quadrant splitting and subpixels
				canvas.width = rowLength*4
				canvas.height = rowLength*aspectRatio*4*charAspect
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
	charset.drawCharQuadrants()


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