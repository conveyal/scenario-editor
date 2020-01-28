// Returns 4x4 array of values to use from the grid.
export function getCellsFromGrid(grid, x, y) {
  // Deal with the edges of the input grid by duplicating adjacent values.
  // It's tempting to do this with typed arrays and slice(), but we need
  // special handling for the grid edges.
  const xs = [
    x === 0 ? x : x - 1, // handle left edge
    x,
    x + 1 >= grid.width ? x : x + 1, // handle right edge
    x + 2 >= grid.width ? x : x + 2 // handle right edge
  ]
  const ys = [
    y === 0 ? y : y - 1, // handle top
    y,
    y + 1 >= grid.height ? y : y + 1, //handle bottom edge
    y + 2 >= grid.height ? y : y + 2 // handle bottom edge
  ]
  return xs.map(x => ys.map(y => grid.getValue(x, y)))
}

/**
 * Given four adjacent values a, b, c, d, fit a curve to them. The returned
 * function provides interpolated values between b and c using a and d to
 * determine the slope going into and out of the b-c interval.
 */
export function cubicHermiteInterpolator([a, b, c, d]) {
  const c3 = -a / 2.0 + (3.0 * b) / 2.0 - (3.0 * c) / 2.0 + d / 2.0
  const c2 = a - (5.0 * b) / 2.0 + 2.0 * c - d / 2.0
  const c1 = -a / 2.0 + c / 2.0
  const c0 = b
  // This function takes a value in [0, 1] expressing the position between b
  // and c, and returns the interpolated value.
  return f => c3 * f ** 3 + c2 * f ** 2 + c1 * f + c0
}

/**
 * Given four adjacent values [a b c d] fit a constrained cubic spline to them,
 * sacrificing smoothness to prevent overshoot. The returned function provides
 * interpolated values between b and c using a and d to determine the slope
 * going into and out of the b-c interval.
 * The original paper handles the general case where data points are (x,y)
 * pairs. In our case, the four points are always evenly spaced, so we assign X
 * coordinates of -1, 0, 1, 2 knowing we will perform interpolation between the
 * second and third points. This greatly simplifies the equations, because it
 * gives many differences, multipliers, and denominators have a value of 1.
 */
export function interpolatorSpline([a, b, c, d]) {
  // Optimization: if b and c are equal, interpolate a straight line
  if (b === c) return () => b
  const bSlope = slopeSpline(a, b, c)
  const cSlope = slopeSpline(b, c, d)
  const bSlope2 = -(2 * cSlope + 4 * bSlope) + 6 * (c - b) // equation 8
  const cSlope2 = +(4 * cSlope + 2 * bSlope) - 6 * (c - b) // equation 9
  const kd = (cSlope2 - bSlope2) / 6 // equation 10
  const kc = bSlope2 / 2 // equation 11
  const kb = c - b - kc - kd // equation 12
  const ka = b // equation 13
  // The returned function takes an x value in [0, 1] expressing the position
  // between b and c, and returns the interpolated value.
  return x => ka + kb * x + kc * x ** 2 + kd * x ** 3
}

/**
 * This function implements equation 7a from the original constrained spline
 * interpolation paper. It finds the target slope at a particular data point.
 * y here is the same as y sub i in the equations in the paper. yPrev here is y
 * sub i-1 and yNext here is y sub i+1.
 * The equations are simplified significantly by the fact that we know all of
 * our points are exactly one unit apart. We don't have a separate equation for
 * slope at the endpoints (which requries recursively computing slopes).
 * Instead we just duplicate the values at the edge of the grid.
 */
function slopeSpline(yPrev, y, yNext) {
  const prevSlope = y - yPrev
  const postSlope = yNext - y
  // Necessary to prevent overshoot
  if (prevSlope === 0 || postSlope === 0) return 0
  // Includes case where only one slope is zero
  if (Math.sign(prevSlope) !== Math.sign(postSlope)) return 0
  return 2 / (1 / postSlope + 1 / prevSlope)
}

/**
 * A pre-calculated bicubic interpolation patch.
 * For a 4x4 grid of samples, this allows us to calculate interpolated values
 * between the central four samples. By pre-fitting the curves in one dimension
 * (y) and proceeding with the interpolation row by row, we re-use most of the
 * computation from one output pixel to the next.
 */
export default function interpolatePoint(
  grid,
  x,
  y,
  createInterpolator = interpolatorSpline
) {
  // 2D Array of each x/y cell value.
  const cells = getCellsFromGrid(grid, x, y)

  // Create interpolations through each of the four columns.
  // Supply an unrolled row-major grid of 16 values (a 4x4 grid).
  // The resulting object can be used to interpolate between the inner four cells.
  const columnInterpolators = cells.map(createInterpolator)

  return function createInterpolatorForRow(yFraction) {
    // Perform curve fitting in the second (x) dimension based on the pre-fit
    // curves in the y dimension.
    const interpolatedColumns = columnInterpolators.map(ci => ci(yFraction))

    // Return the one-dimensional interpolator for this row.
    return createInterpolator(interpolatedColumns)
  }
}

// Set the gridOffset.
interpolatePoint.gridOffset = 0.5
