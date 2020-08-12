import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectActiveRegionalAnalysis from './active-regional-analysis'
import selectRegionalAnalyses from './regional-analyses'

export default createSelector(
  (state) => get(state, 'regionalAnalyses.activeJobs'),
  selectActiveRegionalAnalysis,
  selectRegionalAnalyses,
  (activeJobs = [], analysis = {}, regionalAnalyses) =>
    regionalAnalyses
      // don't compare incomparable analyses
      .filter(
        ({_id, zoom, width, height, north, west}) =>
          activeJobs.findIndex((job) => job.jobId === _id) === -1 &&
          zoom === analysis.zoom &&
          width === analysis.width &&
          height === analysis.height &&
          north === analysis.north &&
          west === analysis.west
      )
)
