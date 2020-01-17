import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectComparisonAnalyses from './comparison-analyses'

export default createSelector(
  selectComparisonAnalyses,
  state => get(state, 'analysis.regional.comparisonId'),
  (analyses = [], _id) => analyses.find(r => r._id === _id)
)
