import get from 'lodash/get'
import {createSelector} from 'reselect'

import {activeOpportunityDataset} from '../modules/opportunity-datasets/selectors'

import selectMaxTripDurationMinutes from './max-trip-duration-minutes'
import selectNearestPercentileIndex from './nearest-percentile-index'
import selectTravelTimePercentile from './travel-time-percentile'

export function computeAccessibility(
  travelTimeSurface,
  cutoff,
  opportunityDataset,
  percentile
) {
  if (
    travelTimeSurface == null ||
    opportunityDataset == null ||
    opportunityDataset.grid == null
  ) {
    return null
  }

  // Corresponds to an index in the array of percentiles sent
  const DEPTH = selectNearestPercentileIndex(percentile)

  // If the accessbility was calculated on the server side this array will exist.
  if (Array.isArray(travelTimeSurface.accessibility)) {
    const destinationPointSetIndex = 0 // Only one destination point set is currently used.
    return travelTimeSurface.accessibility[destinationPointSetIndex][DEPTH][
      cutoff
    ]
  }

  let accessibility = 0
  const {grid} = opportunityDataset
  // y on outside, loop in order, hope the CPU figures this out and prefetches
  for (let y = 0; y < grid.height; y++) {
    const travelTimeY = y + grid.north - travelTimeSurface.north
    if (travelTimeY < 0 || travelTimeY >= travelTimeSurface.height) continue
    for (let x = 0; x < grid.width; x++) {
      const travelTimeX = x + grid.west - travelTimeSurface.west
      if (travelTimeX < 0 || travelTimeX >= travelTimeSurface.width) continue
      // less than is correct here, times are floored on the server when
      // converted from seconds to minutes, so a travel time of 59m59s will have
      // a value of 59, not 60.
      if (travelTimeSurface.get(travelTimeX, travelTimeY, DEPTH) < cutoff) {
        accessibility += grid.data[y * grid.width + x]
      }
    }
  }

  return accessibility
}

export default createSelector(
  (state) => get(state, 'analysis.travelTimeSurface'),
  selectMaxTripDurationMinutes,
  activeOpportunityDataset,
  selectTravelTimePercentile,
  computeAccessibility
)
