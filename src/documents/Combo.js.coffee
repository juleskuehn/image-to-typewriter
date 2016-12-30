
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
    this.BLbrightness = 0
    this.BRbrightness = 0
    this.TLbrightness = 0
    this.TRbrightness = 0

    compStyle = "multiply"

    # set up composite image canvas
    cvs = document.createElement('canvas')
    cvs.width = charset.qWidth
    cvs.height = charset.qHeight
    ctx = cvs.getContext("2d")
    ctx.globalCompositeOperation = compStyle

    # set up composite image canvas
    cvs1 = document.createElement('canvas')
    cvs1.width = charset.qWidth/2
    cvs1.height = charset.qHeight/2
    ctx1 = cvs1.getContext("2d")
    ctx1.globalCompositeOperation = compStyle

    # set up composite image canvas
    cvs2 = document.createElement('canvas')
    cvs2.width = charset.qWidth/2
    cvs2.height = charset.qHeight/2
    ctx2 = cvs2.getContext("2d")
    ctx2.globalCompositeOperation = compStyle

    # set up composite image canvas
    cvs3 = document.createElement('canvas')
    cvs3.width = charset.qWidth/2
    cvs3.height = charset.qHeight/2
    ctx3 = cvs3.getContext("2d")
    ctx3.globalCompositeOperation = compStyle

    # set up composite image canvas
    cvs4 = document.createElement('canvas')
    cvs4.width = charset.qWidth/2
    cvs4.height = charset.qHeight/2
    ctx4 = cvs4.getContext("2d")
    ctx4.globalCompositeOperation = 'multiply'

    # generate composite image from 4 characters
    img = document.createElement("img")
    # draw bottom right quadrant of top left character
    img.src = document.getElementById('charBR'+selected[this.TL].index).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    ctx1.drawImage(img,0,0,cvs.width,cvs.height)
    ctx2.drawImage(img,-charset.qWidth/2,0,cvs.width,cvs.height)
    ctx3.drawImage(img,0,-charset.qHeight/2,cvs.width,cvs.height)
    ctx4.drawImage(img,-charset.qWidth/2,-charset.qHeight/2,cvs.width,cvs.height)
    # draw bottom left quadrant of top right character
    img.src = document.getElementById('charBL'+selected[this.TR].index).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    ctx1.drawImage(img,0,0,cvs.width,cvs.height)
    ctx2.drawImage(img,-charset.qWidth/2,0,cvs.width,cvs.height)
    ctx3.drawImage(img,0,-charset.qHeight/2,cvs.width,cvs.height)
    ctx4.drawImage(img,-charset.qWidth/2,-charset.qHeight/2,cvs.width,cvs.height)
    # draw top right quadrant of bottom left character
    img.src = document.getElementById('charTR'+selected[this.BL].index).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    ctx1.drawImage(img,0,0,cvs.width,cvs.height)
    ctx2.drawImage(img,-charset.qWidth/2,0,cvs.width,cvs.height)
    ctx3.drawImage(img,0,-charset.qHeight/2,cvs.width,cvs.height)
    ctx4.drawImage(img,-charset.qWidth/2,-charset.qHeight/2,cvs.width,cvs.height)
    # draw top left quadrant of bottom right character
    img.src = document.getElementById('charTL'+selected[this.BR].index).toDataURL("image/png")
    ctx.drawImage(img,0,0,cvs.width,cvs.height)
    ctx1.drawImage(img,0,0,cvs.width,cvs.height)
    ctx2.drawImage(img,-charset.qWidth/2,0,cvs.width,cvs.height)
    ctx3.drawImage(img,0,-charset.qHeight/2,cvs.width,cvs.height)
    ctx4.drawImage(img,-charset.qWidth/2,-charset.qHeight/2,cvs.width,cvs.height) 
    # combo image has been generated store it in object
    this.image = ctx.getImageData 0,0,cvs.width,cvs.height
    this.imgTL = ctx1.getImageData 0,0,cvs.width/2,cvs.height/2
    this.imgTR = ctx2.getImageData 0,0,cvs.width/2,cvs.height/2
    this.imgBL = ctx3.getImageData 0,0,cvs.width/2,cvs.height/2
    this.imgBR = ctx4.getImageData 0,0,cvs.width/2,cvs.height/2

    # sum brightness of all pixels in combo image
    for p in [0...this.image.data.length] by 4
      this.brightness += this.image.data[p]
      this.brightness += this.image.data[p+1]
      this.brightness += this.image.data[p+2]

    for p in [0...this.imgTL.data.length] by 4
      this.TLbrightness += this.imgTL.data[p]
      this.TLbrightness += this.imgTL.data[p+1]
      this.TLbrightness += this.imgTL.data[p+2]

    for p in [0...this.imgTR.data.length] by 4
      this.TRbrightness += this.imgTR.data[p]
      this.TRbrightness += this.imgTR.data[p+1]
      this.TRbrightness += this.imgTR.data[p+2]

    for p in [0...this.imgBL.data.length] by 4
      this.BLbrightness += this.imgBL.data[p]
      this.BLbrightness += this.imgBL.data[p+1]
      this.BLbrightness += this.imgBL.data[p+2]

    for p in [0...this.imgBR.data.length] by 4
      this.BRbrightness += this.imgBR.data[p]
      this.BRbrightness += this.imgBR.data[p+1]
      this.BRbrightness += this.imgBR.data[p+2]