// @flow
import lonlat from '@conveyal/lonlat'
import turfDistance from '@turf/distance'
import turf from '@turf/helpers'

import type {LonLatC, GTFSStop} from '../types'

const CIRCUMFERENCE_OF_EARTH_METERS = 40000000
const PIXEL_RADIUS = 10

export default function getStopNearPoint (point: LonLatC, stops: GTFSStop[], zoom: number): GTFSStop | void {
  // base snap distance on map zoom
  const metersPerPixel = CIRCUMFERENCE_OF_EARTH_METERS / (256 * Math.pow(2, zoom))
  const maxDistanceKilometers = (PIXEL_RADIUS * metersPerPixel) / 1000
  const clickPoint = turf.point(lonlat.toCoordinates(point))

  let closestStopDistance = Infinity
  let closestStop
  for (const stop of stops) {
    const stopDistance = turfDistance(clickPoint, turf.point([stop.stop_lon, stop.stop_lat]))
    if (stopDistance < maxDistanceKilometers && stopDistance < closestStopDistance) {
      closestStopDistance = stopDistance
      closestStop = stop
    }
  }

  return closestStop
}
