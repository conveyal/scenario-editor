import {createSelector} from 'reselect'

import {computeIsochrones} from './isochrone'
import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

/** Selector for the comparison project isochrone */
export default createSelector(
  (state) => state.analysis.comparisonTravelTimeSurface,
  selectMaxTripDurationMinutes,
  computeIsochrones
)
