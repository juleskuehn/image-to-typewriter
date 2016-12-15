
# Takes a sorted array of character objects
# First is the brightest (blank) character.
#
# Returns a 4d array of combo objects

window.genCombos = (charset) ->
  # Array of char objects
  # Indices correspond to the indices of the 
  # chars composing the combo [TL][TR][BL][BR]
  combos = []
  # Generate all possible combos
  for a in [0...charset.chars.length]
    combos.push []
    for b in [0...charset.chars.length]
      combos[a].push []
      for c in [0...charset.chars.length]
        combos[a][b].push []
        for d in [0...charset.chars.length]
          combos[a][b][c].push new Combo(a,b,c,d,charset);

  return combos