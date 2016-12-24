
# Class representing a character
#
# Constructor takes 4 image quadrants TL,TR,BL,BR
# and weighs them

class window.Char

  constructor: (@TL,@TR,@BL,@BR) ->
    this.brightness = 0
    # sum brightness of all pixels in all quadrants
    for p in [0...this.TL.data.length] by 4
        this.brightness += this.TL.data[p]
        this.brightness += this.TL.data[p+1]
        this.brightness += this.TL.data[p+2]
        this.brightness += this.TR.data[p]
        this.brightness += this.TR.data[p+1]
        this.brightness += this.TR.data[p+2]
        this.brightness += this.BL.data[p]
        this.brightness += this.BL.data[p+1]
        this.brightness += this.BL.data[p+2]
        this.brightness += this.BR.data[p]
        this.brightness += this.BR.data[p+1]
        this.brightness += this.BR.data[p+2]

    this.selected = false
    this.index = 0