// @flow
import jsolines from 'jsolines'
import {Map as LeafletMap} from 'leaflet'
import get from 'lodash/get'
import {createSelector} from 'reselect'

import {TRAVEL_TIME_PERCENTILES} from '../constants'

import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

/**
 * SingleValuedSurface, width, height all come from selector defined below and
 * thus must be passed in one argument.
 */
export function computeIsochrone (singleValuedSurface: any, cutoff: number) {
  if (singleValuedSurface == null) return null

  const {surface, width, height, west, north, zoom} = singleValuedSurface

  return jsolines({
    surface,
    width,
    height,
    cutoff,
    project: ([x, y]) => {
      const {lat, lng} = LeafletMap.prototype.unproject(
        [x + west, y + north],
        zoom
      )
      return [lng, lat]
    }
  })
}

/**
 * The travel time surface contains percentiles, compute a surface with a single
 * percentile for jsolines done separately from isochrone computation because it
 * can be saved when the isochrone cutoff changes when put in a separate
 * selector, memoization will handle this for us.
 */
export function computeSingleValuedSurface (travelTimeSurface: any, percentile: number) {
  if (travelTimeSurface == null) return null
  const surface = new Uint8Array(
    travelTimeSurface.width * travelTimeSurface.height
  )

  let percentileIndex = 0
  let closestDiff = Infinity
  // get the closest percentile
  TRAVEL_TIME_PERCENTILES.forEach((p, i) => {
    const currentDiff = Math.abs(p - percentile)
    if (currentDiff < closestDiff) {
      percentileIndex = i
      closestDiff = currentDiff
    }
  })

  // y on outside, loop in order, hope the CPU figures this out and prefetches
  for (let y = 0; y < travelTimeSurface.height; y++) {
    for (let x = 0; x < travelTimeSurface.width; x++) {
      const index = y * travelTimeSurface.width + x
      surface[index] = travelTimeSurface.get(x, y, percentileIndex)
    }
  }

  return {
    ...travelTimeSurface,
    surface
  }
}

const singleValuedSurface = createSelector(
  state => state.analysis.travelTimeSurface,
  state => get(state, 'analysis.profileRequest.travelTimePercentile', 50),
  computeSingleValuedSurface
)

export default createSelector(
  singleValuedSurface,
  selectMaxTripDurationMinutes,
  computeIsochrone
)
