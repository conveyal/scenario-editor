import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectActiveAnalysis from './active-regional-analysis'
import selectComparisonAnalysis from './comparison-regional-analysis'
import selectComparisonCutoff from './regional-comparison-cutoff'
import selectComparisonPercentile from './regional-comparison-percentile'
import selectDisplayCutoff from './regional-display-cutoff'
import selectDisplayPercentile from './regional-display-percentile'

const findGrid = (grids, analysis, cutoff, percentile) =>
  analysis &&
  grids.find(
    g =>
      g.analysisId === analysis._id &&
      g.cutoff === cutoff &&
      g.percentile === percentile
  )

const selectGrid = createSelector(
  state => get(state, 'regionalAnalyses.grids'),
  selectActiveAnalysis,
  selectDisplayCutoff,
  selectDisplayPercentile,
  findGrid
)

const selectComparisonGrid = createSelector(
  state => get(state, 'regionalAnalyses.grids'),
  selectComparisonAnalysis,
  selectComparisonCutoff,
  selectComparisonPercentile,
  findGrid
)

export default createSelector(
  selectGrid,
  selectComparisonGrid,
  (activeGrid, comparisonGrid) => {
    return activeGrid && comparisonGrid
      ? subtract(activeGrid, comparisonGrid)
      : activeGrid
  }
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

  // To be consistent with Grid formats. Contains comes from the other grids.
  newGrid.getValue = (x, y) =>
    newGrid.contains(x, y) ? newGrid.data[y * a.width + x] : 0

  return newGrid
}
