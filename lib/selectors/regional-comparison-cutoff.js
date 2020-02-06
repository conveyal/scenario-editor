import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectAnalysis from './comparison-regional-analysis'
import selectCutoff from './regional-display-cutoff'

// Use the selected cutoff if comparison is not set
export default createSelector(
  selectAnalysis,
  selectCutoff,
  state => parseInt(get(state, 'queryString.comparisonCutoff')),
  (analysis, cutoff, comparison) => {
    const cutoffs = get(analysis, 'cutoffsMinutes', [])
    if (cutoffs.indexOf(comparison) >= 0) return comparison
    if (cutoffs.indexOf(cutoff) >= 0) return cutoff
    return cutoffs[Math.floor(cutoffs.length / 2)]
  }
)
