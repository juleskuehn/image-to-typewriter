
# Class representing a combination of 4 characters
#
# Constructor takes 4 character indices
# and array of char objects
#
# 6 attrs: the composite image, its brightness and;
# top left, top right, bottom left, and bottom right
# character indices (to verify against 4d array index)

class window.Combo

  # composite image of this combo quadrant
  image = []
  # brightness of this combo quadrant
  brightness = 0

  constructor: (@TL,@TR,@BL,@BR,charset,selected) ->

    chars = selected

    this.brightness = 0

    # set up composite image canvas
    cvs = document.createElement('canvas')
    cvs.width = charset.qWidth
    cvs.height = charset.qHeight
    ctx = cvs.getContext("2d")
    ctx.globalCompositeOperation = 'multiply'

    # generate composite image from 4 characters
    img = document.createElement("img");
    # draw bottom right quadrant of top left character
    img.src = document.getElementById('charBR'+this.TL).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    # draw bottom left quadrant of top right character
    img.src = document.getElementById('charBL'+this.TR).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    # draw top right quadrant of bottom left character
    img.src = document.getElementById('charTR'+this.BL).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    # draw top left quadrant of bottom right character
    img.src = document.getElementById('charTL'+this.BR).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    
    # combo image has been generated store it in object
    this.image = ctx.getImageData 0,0,cvs.width,cvs.height

    # sum brightness of all pixels in combo image
    for p in [0...this.image.data.length] by 4
      this.brightness += this.image.data[p]
      this.brightness += this.image.data[p+1]
      this.brightness += this.image.data[p+2]

    console.log this
