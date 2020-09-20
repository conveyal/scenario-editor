import get from 'lodash/get'

export default function selectComparisonRegionalAnalysisId(state) {
  return get(state, 'queryString.comparisonAnalysisId')
}
