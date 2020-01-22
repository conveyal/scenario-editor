import get from 'lodash/get'

export default function(state) {
  return get(state, 'regionalAnalyses.activeId')
}
