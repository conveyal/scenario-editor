//
import {TRAVEL_TIME_PERCENTILES} from '../constants'

export default function selectNearestPercentileIndex(requestedPercentile) {
  let percentileIndex = 0
  let closestDiff = Infinity
  // get the closest percentile
  TRAVEL_TIME_PERCENTILES.forEach((p, i) => {
    const currentDiff = Math.abs(p - requestedPercentile)
    if (currentDiff < closestDiff) {
      percentileIndex = i
      closestDiff = currentDiff
    }
  })

  return percentileIndex
}
