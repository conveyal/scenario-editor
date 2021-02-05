import get from 'lodash/get'
import {createSelector} from 'reselect'

import selectComparisonId from './comparison-regional-analysis-id'
import selectComparisonCutoff from './regional-comparison-cutoff'
import selectComparisonPercentile from './regional-comparison-percentile'
import selectComparisonPointSet from './regional-comparison-destination-pointset'
import selectAnalysisId from './current-regional-analysis-id'
import selectDisplayCutoff from './regional-display-cutoff'
import selectDisplayPercentile from './regional-display-percentile'
import selectDisplayPointSet from './regional-display-destination-pointset'

const findGrid = (
  grids: CL.RegionalGrid[],
  analysisId: string,
  cutoff: number,
  percentile: number,
  pointSet: string
) =>
  grids.find(
    (g) =>
      g.analysisId === analysisId &&
      g.cutoff === cutoff &&
      g.percentile === percentile &&
      g.pointSetId === get(pointSet, '_id')
  )

export const active = createSelector(
  (state) => get(state, 'regionalAnalyses.grids'),
  selectAnalysisId,
  selectDisplayCutoff,
  selectDisplayPercentile,
  selectDisplayPointSet,
  findGrid
)

export const comparison = createSelector(
  (state) => get(state, 'regionalAnalyses.grids'),
  selectComparisonId,
  selectComparisonCutoff,
  selectComparisonPercentile,
  selectComparisonPointSet,
  findGrid
)
