import lonlat, {LonLatCompatible} from '@conveyal/lonlat'
import {lineString} from '@turf/helpers'

import getRoutePolyline from './get-route-polyline'

export default async function getLineString(
  from: LonLatCompatible,
  to: LonLatCompatible,
  {followRoad}: {followRoad: boolean}
): Promise<GeoJSON.LineString> {
  try {
    if (followRoad) {
      return await getRoutePolyline(from, to)
    } else {
      return await lineString([
        lonlat.toCoordinates(from),
        lonlat.toCoordinates(to)
      ]).geometry
    }
  } catch (e) {
    console.error(e.stack)
    throw e
  }
}
