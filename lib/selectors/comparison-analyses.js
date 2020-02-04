import {createSelector} from 'reselect'

import selectActiveRegionalAnalysis from './active-regional-analysis'
import selectRegionalAnalyses from './regional-analyses'

export default createSelector(
  selectActiveRegionalAnalysis,
  selectRegionalAnalyses,
  (analysis = {}, regionalAnalyses) =>
    regionalAnalyses
      // don't compare incomparable analyses
      .filter(
        ({zoom, width, height, north, west}) =>
          zoom === analysis.zoom &&
          width === analysis.width &&
          height === analysis.height &&
          north === analysis.north &&
          west === analysis.west
      )
)
