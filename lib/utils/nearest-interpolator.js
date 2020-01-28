/**
 * A nearest-neighbor interpolation patch for a 2x2 grid of samples. This
 * returns a constant value from the upper left corner of the patch. The nested
 * functions maintain consistency with the other interpolators, which work row
 * by row.
 */
export default function nearestNeighborInterpolator(grid, gridX, gridY) {
  const z = grid.getValue(gridX, gridY)
  return (/*y*/) => (/*x*/) => z
}

// Required by drawTile
nearestNeighborInterpolator.gridOffset = 0
