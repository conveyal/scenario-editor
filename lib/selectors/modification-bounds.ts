// Can import Leaflet here as this is only used directly on the map
import {LatLng, latLngBounds} from 'leaflet'
import flatMap from 'lodash/flatMap'
import {createSelector} from 'reselect'

import {
  ADD_STREETS,
  ADD_TRIP_PATTERN,
  MODIFY_STREETS,
  REROUTE
} from '../constants'

import selectActiveModification from './active-modification'
import selectRoutePatterns from './route-patterns'

const coordsFromSegments = (segments: CL.ModificationSegment[]) =>
  flatMap(segments, (s) =>
    s.geometry.type === 'Point'
      ? [new LatLng(s.geometry.coordinates[1], s.geometry.coordinates[0])]
      : s.geometry.coordinates.map((p) => new LatLng(p[1], p[0]))
  )

const coordsFromPatterns = (patterns: GTFS.Pattern[]) =>
  flatMap(patterns, (p) =>
    p.geometry.coordinates.map((c) => new LatLng(c[1], c[0]))
  )

function getCoordinatesFromModification(
  m: CL.IModification,
  patterns: GTFS.Pattern[]
): LatLng[] {
  switch (m.type) {
    case ADD_STREETS:
      return flatMap((m as CL.AddStreets).lineStrings, (lineString) =>
        lineString.map((c: GeoJSON.Position) => new LatLng(c[1], c[0]))
      )
    case MODIFY_STREETS:
      return flatMap((m as CL.ModifyStreets).polygons, (polygon) =>
        polygon.map((c: GeoJSON.Position) => new LatLng(c[1], c[0]))
      )
    case ADD_TRIP_PATTERN:
      return coordsFromSegments((m as CL.AddTripPattern).segments)
    case REROUTE:
      return [
        ...coordsFromSegments((m as CL.Reroute).segments),
        ...coordsFromPatterns(patterns)
      ]
    default:
      return coordsFromPatterns(patterns)
  }
}

export default createSelector(
  selectActiveModification,
  selectRoutePatterns,
  (m, patterns) => {
    if (m) {
      const coords = getCoordinatesFromModification(m, patterns)
      if (coords.length > 1) {
        return latLngBounds(coords)
      }
    }
  }
)
