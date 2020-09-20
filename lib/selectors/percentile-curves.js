//
import fill from 'lodash/fill'
import times from 'lodash/times'
import {createSelector} from 'reselect'

import {activeOpportunityDatasetGrid} from '../modules/opportunity-datasets/selectors'

const MAX_TRIP_DURATION = 120

function computePercentile({grid, percentileIndex, travelTimeSurface}) {
  const dataThisPercentile = fill(Array(MAX_TRIP_DURATION), 0)
  const north = grid.north - travelTimeSurface.north
  const west = grid.west - travelTimeSurface.west

  for (let y = 0; y < grid.height; y++) {
    const travelTimeY = y + north
    if (travelTimeY >= 0 && travelTimeY < travelTimeSurface.height) {
      for (let x = 0; x < grid.width; x++) {
        const travelTimeX = x + west
        if (travelTimeX >= 0 && travelTimeX < travelTimeSurface.width) {
          const travelTime = travelTimeSurface.get(
            travelTimeX,
            travelTimeY,
            percentileIndex
          )

          if (travelTime < MAX_TRIP_DURATION) {
            // dataThisPercentile[i] is the marginal accessibility from minute i
            // to minute i + 1. Travel times are floored from seconds to minutes
            // on the server so using the floored value as an index is correct.
            dataThisPercentile[travelTime] += grid.data[y * grid.width + x]
          }
        }
      }
    }
  }

  // make non-cumulative
  for (let i = 1; i < dataThisPercentile.length; i++) {
    dataThisPercentile[i] += dataThisPercentile[i - 1]
  }

  return dataThisPercentile
}

/**
 * Percentile curves data is an array of cumulative accessibility curves for
 * different percentiles.
 */
export function computePercentileCurves({travelTimeSurface, grid}) {
  // If the accessbility was calculated on the server side this array will exist.
  if (Array.isArray(travelTimeSurface.accessibility)) {
    const destinationPointSetIndex = 0 // Only one destination point set is currently used.
    return travelTimeSurface.accessibility[destinationPointSetIndex]
  }

  return times(travelTimeSurface.depth, (percentileIndex) =>
    computePercentile({
      grid,
      percentileIndex,
      travelTimeSurface
    })
  )
}

export default createSelector(
  (state) => state.analysis.travelTimeSurface,
  activeOpportunityDatasetGrid,
  (travelTimeSurface, grid) =>
    travelTimeSurface && grid
      ? computePercentileCurves({grid, travelTimeSurface})
      : undefined
)
