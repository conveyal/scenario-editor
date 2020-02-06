import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectAnalysis from './active-regional-analysis'

export default createSelector(
  selectAnalysis,
  state => parseInt(get(state, 'queryString.percentile')),
  (analysis, percentile) => {
    const percentiles = get(analysis, 'travelTimePercentiles', [])
    if (percentiles.indexOf(percentile) >= 0) return percentile
    return percentiles[Math.floor(percentiles.length / 2)]
  }
)
