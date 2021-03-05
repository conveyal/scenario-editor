import get from 'lodash/get'
export default function selectRegionalAnalyses(state) {
  return get(state, 'regionalAnalyses.analyses', [])
}
