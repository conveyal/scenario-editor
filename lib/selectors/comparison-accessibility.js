// @flow
import {createSelector} from 'reselect'
import {computeAccessibility} from './accessibility'

import OpportunityDatasets from '../modules/opportunity-datasets'
import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

/**
 * Select comparison surface accessibility
 */
export default createSelector(
  state => state.analysis.comparisonTravelTimeSurface,
  selectMaxTripDurationMinutes,
  OpportunityDatasets.selectors.selectActiveOpportunityDataset,
  computeAccessibility
)
