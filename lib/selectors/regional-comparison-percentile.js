import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectAnalysis from './comparison-regional-analysis'
import selectPercentile from './regional-display-percentile'

// Use the selected percentile if comparison is not set
export default createSelector(
  selectAnalysis,
  selectPercentile,
  (state) => parseInt(get(state, 'queryString.comparisonPercentile')),
  (analysis, percentile, comparison) => {
    const percentiles = get(analysis, 'travelTimePercentiles') || []
    if (percentiles.indexOf(comparison) >= 0) return comparison
    if (percentiles.indexOf(percentile) >= 0) return percentile
    return (
      percentiles[Math.floor(percentiles.length / 2)] ||
      get(analysis, 'travelTimePercentile')
    )
  }
)
