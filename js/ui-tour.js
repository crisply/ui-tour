test = angular.module("test", [])

function random_int(n) {
  return Math.floor(Math.random() * n)
}

function lines_from_offsets(offsets, prop1, prop2) {
  var lines = []
  for (var i = 0 ; i < offsets.length ; i++) {
    console.log("lines_from_offsets", prop1, offsets[i][prop1], prop2, offsets[i][prop2])
    lines.push(offsets[i][prop1])
    lines.push(offsets[i][prop1] + offsets[i][prop2])
  }
  
  return lines.sort(function(a,b) { return a - b})
}

function bands_from_lines(lines, prop1, prop2) {
  var bands = []
  
  for (var i = 0 ; i < lines.length - 1; i++) {
    obj = {}
    obj[prop1] = lines[i]
    obj[prop2] = lines[i+1] - lines[i]
    bands.push(obj)
  }
  
  return bands
}
 
function convert_to_coords(rect) {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height
  }
}
function rect_contained(rect, inside) {
  var r = convert_to_coords(rect)
  var i = convert_to_coords(inside)
  
  var contained = i.left >= r.left && i.right <= r.right && i.top >= r.top && i.bottom <= r.bottom
  console.log("rect_contained", r, i, contained)
  return contained
}

function inflate_offset(offset, amount) {
  obj = {
    left: offset.left - amount,
    top: offset.top - amount,
    width: offset.width + amount + amount,
    height: offset.height + amount + amount
  }

  return obj
}
function blocks_from_offsets(offsets) {
  offsets = offsets.map(function(offset) {
    return inflate_offset(offset, 20)
  })
  var row_lines = lines_from_offsets(offsets, "top", "height")
  var row_bands = bands_from_lines(row_lines, "top", "height")
  var col_lines = lines_from_offsets(offsets, "left", "width")
  var col_bands = bands_from_lines(col_lines, "left", "width")
  console.log("col_bands ", col_bands, "row_bands", row_bands)
  
  var blocks = []
  for (var r = 0 ; r < row_bands.length ; r++) {
    for (var c = 0 ; c < col_bands.length ; c++) {
      var block = {
          left: col_bands[c].left,
          width: col_bands[c].width,
          top: row_bands[r].top,
          height: row_bands[r].height
        }
      matchingOffsets = offsets.filter(function(offset) {
        return rect_contained(offset, block)
      })

      if (matchingOffsets.length == 0) {
        blocks.push(block)
      }
    }
  }
  
  blocks.push(
    {
      left: 0, top: 0, bottom: 0, width: col_lines[0]
    },
    {
      left: col_lines[0], top: 0, right: 0, height: row_lines[0]
    },
    {
      left: col_lines[0], top: row_lines[row_lines.length - 1], right: 0, bottom: 0 
    },
    { 
      left: col_lines[col_lines.length - 1], right: 0, top: row_lines[0], height: row_lines[row_lines.length-1] - row_lines[0]
    }
  )
  return {
    row_lines: row_lines,
    col_lines: col_lines,
    cols: col_bands,
    rows: row_bands,
    blocks: blocks
  }
} 

function style_from_obj(obj) {
    var style = {}
    var props = "left top width height right bottom".split(" ")
    //console.log("style_from_obj", obj)
    for (var p = 0 ; p < props.length ; p++) {
      
      if (props[p] in obj) {
        style[props[p]] = obj[props[p]].toString() + "px"
      }
    }
    
    //console.log("style_from_obj", obj, style)
    return style
}
test.controller("TestController", function($scope) {
  $scope.offsets = []
  for (var i = 0 ; i < 10 ; i++) {
    $scope.offsets.push(
      {
        left: random_int(500), 
        top: random_int(500),
        width: random_int(50) + 50,
        height: random_int(50) + 10
      }
    )
    
  }
  $scope.blocks = blocks_from_offsets($scope.offsets)
  $scope.blocks.offsets = $scope.offsets
  $scope.style_from_obj = style_from_obj
}) 