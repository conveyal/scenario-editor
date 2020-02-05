import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectCutoff from './regional-display-cutoff'

// Use the selected cutoff if comparison is not set
export default createSelector(
  selectCutoff,
  state => get(state, 'queryString.comparisonCutoff'),
  (cutoff, comparison) => (comparison == null ? cutoff : parseInt(comparison))
)
