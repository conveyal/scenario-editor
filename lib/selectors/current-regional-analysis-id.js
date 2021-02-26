import get from 'lodash/get'
export default function selectCurrentRegionalAnalysisId(state) {
  return get(state, 'queryString.analysisId')
}
