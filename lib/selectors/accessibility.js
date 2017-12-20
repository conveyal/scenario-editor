// @flow
import {createSelector} from 'reselect'

import {TRAVEL_TIME_PERCENTILES} from '../constants'
import OpportunityDatasets from '../modules/opportunity-datasets'
import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

import type {TravelTimeSurface} from '../types'
import type {OpportunityDataset} from '../modules/opportunity-datasets/types'

const POSITION = TRAVEL_TIME_PERCENTILES.indexOf(50)

export function computeAccessibility (
  travelTimeSurface: TravelTimeSurface,
  cutoff: number,
  opportunityDataset: OpportunityDataset
) {
  if (travelTimeSurface == null || opportunityDataset == null || opportunityDataset.grid == null) return null

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
      if (
        travelTimeSurface.get(travelTimeX, travelTimeY)[POSITION] <
        cutoff
      ) {
        accessibility += grid.data[y * grid.width + x]
      }
    }
  }

  return accessibility
}

export default createSelector(
  state => state.analysis.travelTimeSurface,
  selectMaxTripDurationMinutes,
  OpportunityDatasets.selectors.selectActiveOpportunityDataset,
  computeAccessibility
)
