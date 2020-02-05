import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectRegionalAnalyses from './regional-analyses'

export default createSelector(
  selectRegionalAnalyses,
  state => get(state, 'queryString.comparisonAnalysisId'),
  (analyses, _id) => analyses.find(r => r._id === _id)
)
