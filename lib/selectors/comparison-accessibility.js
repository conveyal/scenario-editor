// @flow
import {createSelector} from 'reselect'

import {activeOpportunityDataset} from '../modules/opportunity-datasets/selectors'

import {computeAccessibility} from './accessibility'
import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

/**
 * Select comparison surface accessibility
 */
export default createSelector(
  state => state.analysis.comparisonTravelTimeSurface,
  selectMaxTripDurationMinutes,
  activeOpportunityDataset,
  computeAccessibility
)
