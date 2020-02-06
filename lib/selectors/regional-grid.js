import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectActiveAnalysis from './active-regional-analysis'
import selectComparisonAnalysis from './comparison-regional-analysis'
import selectComparisonCutoff from './regional-comparison-cutoff'
import selectComparisonPercentile from './regional-comparison-percentile'
import selectDisplayCutoff from './regional-display-cutoff'
import selectDisplayPercentile from './regional-display-percentile'

const findGrid = (grids, analysis, cutoff, percentile) =>
  analysis &&
  grids.find(
    g =>
      g.analysisId === analysis._id &&
      g.cutoff === cutoff &&
      g.percentile === percentile
  )

export const active = createSelector(
  state => get(state, 'regionalAnalyses.grids'),
  selectActiveAnalysis,
  selectDisplayCutoff,
  selectDisplayPercentile,
  findGrid
)

export const comparison = createSelector(
  state => get(state, 'regionalAnalyses.grids'),
  selectComparisonAnalysis,
  selectComparisonCutoff,
  selectComparisonPercentile,
  findGrid
)
