// @flow
import lonlat, {isEqual as coordinatesAreEqual} from '@conveyal/lonlat'
import {lineString} from '@turf/helpers'

import type {LonLatC} from '../types'

import getRoutePolyline from './get-route-polyline'

const MINIMUM_COORDINATE_DISTANCE = 1e-6

export default async function getLineString (from: LonLatC, to: LonLatC, {followRoad}: {
  followRoad: boolean
}) {
  try {
    if (followRoad) {
      const coordinates = await getRoutePolyline(from, to)
      const c0 = coordinates[0]
      const cy = coordinates[coordinates.length - 1]
      if (!coordinatesAreEqual(c0, from, MINIMUM_COORDINATE_DISTANCE)) {
        coordinates.unshift(lonlat.toCoordinates(from))
      }
      if (!coordinatesAreEqual(cy, to, MINIMUM_COORDINATE_DISTANCE)) {
        coordinates.push(lonlat.toCoordinates(to))
      }

      return {
        type: 'LineString',
        coordinates
      }
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
