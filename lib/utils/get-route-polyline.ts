import lonlat, {LonLatCompatible} from '@conveyal/lonlat'
import {toGeoJSON} from '@mapbox/polyline'

import {MB_TOKEN} from 'lib/constants'

const MINIMUM_COORDINATE_DISTANCE = 1e-6
export const BASE_URL = 'https://api.mapbox.com'
export const PATH = '/directions/v5/mapbox/driving'
export const getMBUrl = (c) =>
  `${BASE_URL}${PATH}/${c}.json?access_token=${MB_TOKEN}&alternatives=false&geometries=polyline`

/**
 * Get a route between two points from Mapbox. If the start and end coordinates
 * received are outside the maximum, append the original start and end points.
 */
export default function getRoutePolyline(
  start: LonLatCompatible,
  end: LonLatCompatible
): Promise<GeoJSON.LineString> {
  const coordinates = encodeURIComponent(
    `${lonlat.toString(start)};${lonlat.toString(end)}`
  )
  return fetch(getMBUrl(coordinates))
    .then((r) => r.json())
    .then((json) => {
      const route = json.routes[0]
      const geojson = toGeoJSON(route.geometry)
      const c0 = geojson.coordinates[0]
      const cy = geojson.coordinates[geojson.coordinates.length - 1]
      if (!lonlat.isEqual(c0, start, MINIMUM_COORDINATE_DISTANCE)) {
        geojson.coordinates.unshift(lonlat.toCoordinates(start))
      }
      if (!lonlat.isEqual(cy, end, MINIMUM_COORDINATE_DISTANCE)) {
        geojson.coordinates.push(lonlat.toCoordinates(end))
      }

      return geojson
    })
}
