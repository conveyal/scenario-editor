// @flow
import {createSelector} from 'reselect'

import selectComparisonPercentileCurves from './comparison-percentile-curves'
import selectPercentileCurves from './percentile-curves'

export default createSelector(
  selectPercentileCurves,
  selectComparisonPercentileCurves,
  (percentileCurves, comparisonPercentileCurves) =>
    (comparisonPercentileCurves
      ? Math.max(
        computeMaxAccessibility(percentileCurves),
        computeMaxAccessibility(comparisonPercentileCurves)
      )
      : computeMaxAccessibility(percentileCurves))
)

/**
 * Compute the maximum value of stacked percentiles
 */
function computeMaxAccessibility (data = []) {
  // TODO held over from spectrogram data, but we know which value is the
  // highest, it's the 120th minute of the lowest percentile travel time
  return Math.max(...data.map(iteration => Math.max(...iteration)))
}
