random_int = (n) ->
  Math.floor Math.random() * n
lines_from_offsets = (offsets, prop1, prop2) ->
  lines = []
  i = 0

  while i < offsets.length
    console.log "lines_from_offsets", prop1, offsets[i][prop1], prop2, offsets[i][prop2]
    lines.push offsets[i][prop1]
    lines.push offsets[i][prop1] + offsets[i][prop2]
    i++
  lines.sort (a, b) ->
    a - b

bands_from_lines = (lines, prop1, prop2) ->
  bands = []
  i = 0

  while i < lines.length - 1
    obj = {}
    obj[prop1] = lines[i]
    obj[prop2] = lines[i + 1] - lines[i]
    bands.push obj
    i++
  bands
convert_to_coords = (rect) ->
  left: rect.left
  top: rect.top
  right: rect.left + rect.width
  bottom: rect.top + rect.height
rect_contained = (rect, inside) ->
  r = convert_to_coords(rect)
  i = convert_to_coords(inside)
  contained = i.left >= r.left and i.right <= r.right and i.top >= r.top and i.bottom <= r.bottom
  console.log "rect_contained", r, i, contained
  contained
inflate_offset = (offset, amount) ->
  obj =
    left: offset.left - amount
    top: offset.top - amount
    width: offset.width + amount + amount
    height: offset.height + amount + amount

  obj
blocks_from_offsets = (offsets) ->
  offsets = offsets.map((offset) ->
    inflate_offset offset, 20
  )
  row_lines = lines_from_offsets(offsets, "top", "height")
  row_bands = bands_from_lines(row_lines, "top", "height")
  col_lines = lines_from_offsets(offsets, "left", "width")
  col_bands = bands_from_lines(col_lines, "left", "width")
  console.log "col_bands ", col_bands, "row_bands", row_bands
  blocks = []
  r = 0

  while r < row_bands.length
    c = 0

    while c < col_bands.length
      block =
        left: col_bands[c].left
        width: col_bands[c].width
        top: row_bands[r].top
        height: row_bands[r].height

      matchingOffsets = offsets.filter((offset) ->
        rect_contained offset, block
      )
      blocks.push block  if matchingOffsets.length is 0
      c++
    r++
  blocks.push
    left: 0
    top: 0
    bottom: 0
    width: col_lines[0]
  ,
    left: col_lines[0]
    top: 0
    right: 0
    height: row_lines[0]
  ,
    left: col_lines[0]
    top: row_lines[row_lines.length - 1]
    right: 0
    bottom: 0
  ,
    left: col_lines[col_lines.length - 1]
    right: 0
    top: row_lines[0]
    height: row_lines[row_lines.length - 1] - row_lines[0]

  row_lines: row_lines
  col_lines: col_lines
  cols: col_bands
  rows: row_bands
  blocks: blocks
style_from_obj = (obj) ->
  style = {}
  props = "left top width height right bottom".split(" ")
  
  #console.log("style_from_obj", obj)
  p = 0

  while p < props.length
    style[props[p]] = obj[props[p]].toString() + "px"  if props[p] of obj
    p++
  
  #console.log("style_from_obj", obj, style)
  style
test = angular.module("test", [])
test.controller "TestController", ($scope) ->
  $scope.offsets = []
  i = 0

  while i < 10
    $scope.offsets.push
      left: random_int(500)
      top: random_int(500)
      width: random_int(50) + 50
      height: random_int(50) + 10

    i++
  $scope.blocks = blocks_from_offsets($scope.offsets)
  $scope.blocks.offsets = $scope.offsets
  $scope.style_from_obj = style_from_obj