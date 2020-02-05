import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectPercentile from './regional-display-percentile'

// Use the selected percentile if comparison is not set
export default createSelector(
  selectPercentile,
  state => get(state, 'queryString.comparisonPercentile'),
  (percentile, comparison) =>
    comparison == null ? percentile : parseInt(comparison)
)
