import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectAnalysis from './active-regional-analysis'

export default createSelector(
  selectAnalysis,
  state => parseInt(get(state, 'queryString.cutoff')),
  (analysis, cutoff) => {
    const cutoffs = get(analysis, 'cutoffsMinutes', [])
    if (cutoffs.indexOf(cutoff) >= 0) return cutoff
    return cutoffs[Math.floor(cutoffs.length / 2)]
  }
)
