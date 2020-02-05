import get from 'lodash/get'
export default state => get(state, 'regionalAnalyses.analyses', [])
