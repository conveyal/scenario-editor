// @flow

/** Extract the distribution of travel times to a destination */

import {toLeaflet} from '@conveyal/lonlat'
import {Map as LeafletMap} from 'leaflet'
import {createSelector} from 'reselect'

import type {LonLat, Quintiles} from '../types'

// exported for comparisonTravelTimeDistribution selector
export function createDestinationTravelTimeDistribution (destination: ?LonLat, travelTimeSurface: ?any): ?Quintiles {
  if (destination == null || travelTimeSurface == null) return null

  let {x, y} = LeafletMap.prototype.project(toLeaflet(destination), travelTimeSurface.zoom)
  x -= travelTimeSurface.west
  y -= travelTimeSurface.north
  // floor them to get top left of cell the point is a part of (TODO correct?)
  const [low, iqrLow, med, iqrHigh, high] = travelTimeSurface.get(Math.floor(x), Math.floor(y))
  return {low, iqrLow, med, iqrHigh, high}
}

export default createSelector(
  state => state.analysis.destination,
  state => state.analysis.travelTimeSurface,
  createDestinationTravelTimeDistribution
)
