// @flow
import {createSelector} from 'reselect'

import {computeSingleValuedSurface, computeIsochrone} from './isochrone'
import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

const comparisonSingleValuedSurface = createSelector(
  state => state.analysis.comparisonTravelTimeSurface,
  computeSingleValuedSurface
)

/** Selector for the comparison project isochrone */
export default createSelector(
  comparisonSingleValuedSurface,
  selectMaxTripDurationMinutes,
  computeIsochrone
)
