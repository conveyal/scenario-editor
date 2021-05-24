import {createSelector} from 'reselect'

import {activeOpportunityDatasetGrid} from 'lib/modules/opportunity-datasets/selectors'

import {computeAccessibilityCurves} from './percentile-curves'

/**
 * Select the percentile curves for the comparison project
 */
export default createSelector(
  (state) => state.analysis.comparisonTravelTimeSurface,
  activeOpportunityDatasetGrid,
  (travelTimeSurface, grid) =>
    travelTimeSurface && grid
      ? computeAccessibilityCurves(travelTimeSurface, grid)
      : null
)
