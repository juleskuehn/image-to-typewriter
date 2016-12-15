
# Takes an image object and charset object.
#
# Returns a 2d array of character indexes
# representing the text image

window.imgToText = (image,allCombos) ->
  # Array of indices for chosen characters.
  out
  # Loop through each pixel in input image.
  for r in [0...image.rows]
    for c in [0...image.cols]
      # Constraints based on already chosen chars
      # The lightest character (space) becomes the
      # constraint when at the top or left edge.
      #
      # TODO:
      # This should be altered to allow spill on the
      # top and left edges (as on the bottom, right)
      TL = if r>0&&c>0 then out[r-1][c-1] else 0
      TR = if r>0      then out[r-1][c]   else 0
      BL = if c>0      then out[r][c-1]   else 0
      # Constrained subset of the combos
      combos = allCombos[TL][TR][BL]
      # Pixel brightness to match
      p = image.data[r][c]
      # Index of the closest character
      bestIndex = 0
      # Worst case scenario error
      bestError = 255
      # Find the closest character to the input pixel
      for i in [0...combos.length]
        error = Math.abs(p-combos[i].brightness)
        if error<bestError
          bestError = error
          bestIndex = i
      # Place the character index in the output array
      out[r][c] = bestIndex

  return out