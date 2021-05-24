import fill from 'lodash/fill'
import times from 'lodash/times'
import {createSelector} from 'reselect'

import {activeOpportunityDatasetGrid} from 'lib/modules/opportunity-datasets/selectors'

const MAX_TRIP_DURATION = 120
const TOTAL_CUTOFFS = MAX_TRIP_DURATION + 1

/**
 * Calculate the accessibility for a given destination point set, travel time surface,
 * and percentile (index).
 */
function computeAccessibilityForPercentile(
  travelTimeSurface: CL.AccessGrid,
  grid: CL.ParsedGrid,
  percentileIndex: number
): number[] {
  const dataThisPercentile = fill(Array(TOTAL_CUTOFFS), 0)
  const north = grid.north - travelTimeSurface.north
  const west = grid.west - travelTimeSurface.west

  for (let y = 0; y < grid.height; y++) {
    const yIndex = y + north
    if (yIndex < 0 || yIndex >= travelTimeSurface.height) continue
    for (let x = 0; x < grid.width; x++) {
      const xIndex = x + west
      if (xIndex < 0 || xIndex >= travelTimeSurface.width) continue
      const travelTime: number = travelTimeSurface.get(
        xIndex,
        yIndex,
        percentileIndex
      )
      // Less than (<) is correct here. Times are floored on the server when
      // converted from seconds to minutes, so a travel time of 59m59s will have
      // a value of 59, not 60.
      if (travelTime < MAX_TRIP_DURATION) {
        // When the decay function is step, the 0th index will always be 0.
        // Index 1 will have the count of opportunities with travel times from zero to one minutes,
        // exclusive. So add 1 to the travel time.
        dataThisPercentile[travelTime + 1] += grid.getValue(x, y)
      }
    }
  }

  // Make cumulative
  for (let i = 1; i < dataThisPercentile.length; i++) {
    dataThisPercentile[i] += dataThisPercentile[i - 1]
  }

  return dataThisPercentile
}

/**
 * Percentile curves data is an array of cumulative accessibility curves for
 * different percentiles.
 */
export function computeAccessibilityCurves(
  travelTimeSurface: CL.AccessGrid,
  grid: CL.ParsedGrid
): number[][] {
  // If the accessbility was calculated on the server side this array will exist.
  if (Array.isArray(travelTimeSurface.accessibility)) {
    const destinationPointSetIndex = 0 // Only one destination point set is currently used.
    return travelTimeSurface.accessibility[destinationPointSetIndex]
  }

  return times(travelTimeSurface.depth, (percentileIndex) =>
    computeAccessibilityForPercentile(travelTimeSurface, grid, percentileIndex)
  )
}

export default createSelector(
  (state) => state.analysis.travelTimeSurface,
  activeOpportunityDatasetGrid,
  (travelTimeSurface, grid) =>
    travelTimeSurface && grid
      ? computeAccessibilityCurves(travelTimeSurface, grid)
      : undefined
)
