
# Class representing a character
#
# Constructor takes 4 image quadrants TL,TR,BL,BR
# and weighs them

class window.Char

  # brightness of this entire character
  # used for finding the lightest (blank) character
  brightness = 0

  # used for correlating combo indexes
  index = 0

  constructor: (@TL,@TR,@BL,@BR) ->
    console.log this.TL
    # sum brightness of all pixels in all quadrants
    for p in [0...this.TL.data.length] by 4
      for q in [this.TL,this.TR,this.BL,this.BR]
        this.brightness += q.data[p]
        this.brightness += q.data[p+1]
        this.brightness += q.data[p+2]
    selected = true