import lonlat, {LonLatCompatible} from '@conveyal/lonlat'
import turfDistance from '@turf/distance'
import {point as turfPoint} from '@turf/helpers'

const CIRCUMFERENCE_OF_EARTH_METERS = 40000000
const PIXEL_RADIUS = 10

export default function getStopNearPoint(
  point: LonLatCompatible,
  allStops: GTFS.Stop[],
  zoom: number
): null | GTFS.Stop {
  // base snap distance on map zoom
  const metersPerPixel =
    CIRCUMFERENCE_OF_EARTH_METERS / (256 * Math.pow(2, zoom))
  const maxDistanceKilometers = (PIXEL_RADIUS * metersPerPixel) / 1000
  const clickPoint = turfPoint(lonlat.toCoordinates(point))

  let closestStopDistance = Infinity
  let closestStop: null | GTFS.Stop = null
  for (const stop of allStops) {
    if (stop.lat && stop.lon) {
      const stopDistance = turfDistance(
        clickPoint,
        turfPoint([stop.lon, stop.lat])
      )
      if (
        stopDistance < maxDistanceKilometers &&
        stopDistance < closestStopDistance
      ) {
        closestStopDistance = stopDistance
        closestStop = stop
      }
    }
  }

  return closestStop
}
