import get from 'lodash/get'
import {createSelector} from 'reselect'

export default createSelector(
  state => get(state, 'analysis.regional.grid'),
  state => get(state, 'analysis.regional.comparisonGrid'),
  (grid, comparisonGrid) =>
    comparisonGrid ? subtract(grid, comparisonGrid) : grid
)

/**
 * Non-destructively subtract grid B from grid A
 */
function subtract(a, b) {
  const gridsDoNotAlign =
    a.west !== b.west ||
    a.north !== b.north ||
    a.zoom !== b.zoom ||
    a.width !== b.width ||
    a.height !== b.height

  if (gridsDoNotAlign) {
    throw new Error('Grids do not align for subtraction')
  }

  const newGrid = {
    ...a,
    data: new Int32Array(a.width * a.height),
    min: Infinity,
    max: -Infinity
  }

  for (let pixel = 0; pixel < a.width * a.height; pixel++) {
    const val = a.data[pixel] - b.data[pixel]
    newGrid.min = Math.min(newGrid.min, val)
    newGrid.max = Math.max(newGrid.max, val)
    newGrid.data[pixel] = val
  }

  // To be consistent with Grid formats
  newGrid.getValue = (x, y) => newGrid.data[y * a.width + x] || 0

  return newGrid
}
