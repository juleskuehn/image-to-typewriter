
# Class representing a combination of 4 characters
#
# Constructor takes 4 character indices
# and array of char objects

class window.Combo

  constructor: (@TL,@TR,@BL,@BR,charset,selected) ->

    # TODO get quadrant images from selected[i].imgXX (not from the DOM)
    # get bottom right quadrant of top left character
    imgTL = document.getElementById('charBR'+selected[this.TL].index).toDataURL("image/png")
    # get bottom left quadrant of top right character
    imgTR = document.getElementById('charBL'+selected[this.TR].index).toDataURL("image/png")
    # get top right quadrant of bottom left character
    imgBL = document.getElementById('charTR'+selected[this.BL].index).toDataURL("image/png")
    # get top left quadrant of bottom right character
    imgBR = document.getElementById('charTL'+selected[this.BR].index).toDataURL("image/png")

    # generate combo images: entire combo quadrant and each subquadrant
    for q in ["","TL","TR","BL","BR"]

      # subquadrants are half the width and height
      if q is "" then m = 1 else m = 0.5

      # images must be drawn at different positions for subquadrants
      [x,y] = switch
        when q is "TR" then [-charset.qWidth/2,0]
        when q is "BL" then [0,-charset.qHeight/2]
        when q is "BR" then [-charset.qWidth/2,-charset.qHeight/2]
        else [0,0]

      # set up composite image canvas
      cvs = document.createElement('canvas')
      cvs.width = charset.qWidth*m
      cvs.height = charset.qHeight*m
      ctx = cvs.getContext("2d")
      ctx.globalCompositeOperation = "multiply"

      # generate composite image from 4 characters
      img = document.createElement("img")
      for image in [imgTL,imgTR,imgBL,imgBR]
        img.src = image
        ctx.drawImage(img,x,y,cvs.width,cvs.height)

      # combo image has been drawn; store it in object
      this["img"+q] = ctx.getImageData(0,0,cvs.width,cvs.height)

      # sum brightness of all pixels in combo image
      this[q+"brightness"] = 0

      for p in [0...this["img"+q].data.length] by 4
        this[q+"brightness"] += this["img"+q].data[p] + this["img"+q].data[p+1] + this["img"+q].data[p+2]

    # TODO change "image" references elsewhere to "img" and remove this line
    this.image = this.img