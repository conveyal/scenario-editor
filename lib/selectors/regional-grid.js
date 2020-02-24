import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectComparisonId from './comparison-regional-analysis-id'
import selectComparisonCutoff from './regional-comparison-cutoff'
import selectComparisonPercentile from './regional-comparison-percentile'
import selectAnalysisId from './current-regional-analysis-id'
import selectDisplayCutoff from './regional-display-cutoff'
import selectDisplayPercentile from './regional-display-percentile'

const findGrid = (grids, analysisId, cutoff, percentile) =>
  grids.find(
    g =>
      g.analysisId === analysisId &&
      g.cutoff === cutoff &&
      g.percentile === percentile
  )

export const active = createSelector(
  state => get(state, 'regionalAnalyses.grids'),
  selectAnalysisId,
  selectDisplayCutoff,
  selectDisplayPercentile,
  findGrid
)

export const comparison = createSelector(
  state => get(state, 'regionalAnalyses.grids'),
  selectComparisonId,
  selectComparisonCutoff,
  selectComparisonPercentile,
  findGrid
)
