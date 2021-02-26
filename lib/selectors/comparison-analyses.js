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
        (c) =>
          activeJobs.findIndex((job) => job.jobId === c._id) === -1 &&
          c.request.originPointSetKey == null &&
          c.zoom === analysis.zoom &&
          c.width === analysis.width &&
          c.height === analysis.height &&
          c.north === analysis.north &&
          c.west === analysis.west
      )
)
