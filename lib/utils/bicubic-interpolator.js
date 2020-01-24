/**
 * A pre-calculated bicubic interpolation patch.
 * For a 4x4 grid of samples, this allows us to calculate interpolated values
 * between the central four samples. By pre-fitting the curves in one dimension
 * (y) and proceeding with the interpolation row by row, we re-use most of the
 * computation from one output pixel to the next.
 */
export default function bicubicInterpolator(grid, gridX, gridY) {
  // First, find grid coordinates for the sixteen cells.
  // Produces a bicubic interpolation patch for a one-cell square.
  // The patch extends one cell east and south of the specified grid position,
  // but uses 16 cells in the grid.

  // Deal with the edges of the input grid by duplicating adjacent values.
  // It's tempting to do this with typed arrays and slice(), but we need
  // special handling for the grid edges.
  const xs = [
    gridX === 0 ? gridX : gridX - 1, // Handle left edge
    gridX,
    gridX + 1 >= grid.width ? gridX : gridX + 1, // Handle right edge
    gridX + 2 >= grid.width ? gridX : gridX + 2 // Handle right edge
  ]
  const ys = [
    gridY === 0 ? gridY : gridY - 1, // Handle top edge
    gridY,
    gridY + 1 >= grid.height ? gridY : gridY + 1, // Handle bottom edge
    gridY + 2 >= grid.height ? gridY : gridY + 2 // Handle bottom edge
  ]

  // 2D Array of each x/y cell value.
  const p = xs.map(x => ys.map(y => grid.getValue(x, y)))

  // Create interpolations through each of the four columns
  // Supply an unrolled row-major grid of 16 values (a 4x4 grid).
  // The resulting object can be used to interpolate between the inner four cells.
  const columnInterpolators = p.map(cubicHermiteInterpolator)

  return function(yFraction) {
    // Perform curve fitting in the second (x) dimension based on the pre-fit
    // curves in the y dimension.
    const interpolatedColumns = columnInterpolators.map(fn => fn(yFraction))
    // Return the one-dimensional interpolator for this row.
    return cubicHermiteInterpolator(interpolatedColumns)
  }
}

// Set the gridOffset. Necessary for contrasting with nearest neighbor interpolator.
bicubicInterpolator.gridOffset = 0.5

/**
 * Given four adjacent values a, b, c, d, fit a curve to them. The returned
 * function provides interpolated values between b and c using a and d to
 * determine the slope going into and out of the b-c interval.
 */
function cubicHermiteInterpolator([a, b, c, d]) {
  const c3 = -a / 2.0 + (3.0 * b) / 2.0 - (3.0 * c) / 2.0 + d / 2.0
  const c2 = a - (5.0 * b) / 2.0 + 2.0 * c - d / 2.0
  const c1 = -a / 2.0 + c / 2.0
  const c0 = b
  // This function takes a value in [0, 1] expressing the position between b
  // and c, and returns the interpolated value.
  return f => c3 * f ** 3 + c2 * f ** 2 + c1 * f + c0
}
