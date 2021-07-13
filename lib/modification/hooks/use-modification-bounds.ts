// Can import Leaflet here as this is only used directly on the map
import {LatLng, latLngBounds} from 'leaflet'
import {flatMap, get} from 'lodash'
import {useMemo} from 'react'

import {
  ADD_STREETS,
  ADD_TRIP_PATTERN,
  MODIFY_STREETS,
  REROUTE
} from 'lib/constants'
import {useRoutePatterns} from 'lib/gtfs/hooks'

const coordsFromSegments = (segments: CL.ModificationSegment[]) =>
  flatMap(segments, (s) =>
    s.geometry.coordinates.map((p) => new LatLng(p[1], p[0]))
  )

const coordsFromPatterns = (patterns: GTFS.Pattern[]) =>
  flatMap(patterns, (p) =>
    p.geometry.coordinates.map((c) => new LatLng(c[1], c[0]))
  )

function getCoordinatesFromModification(
  m: CL.Modification,
  patterns: GTFS.Pattern[]
): LatLng[] {
  switch (m.type) {
    case ADD_STREETS:
      return flatMap(m.lineStrings, (lineString) =>
        lineString.map((c: GeoJSON.Position) => new LatLng(c[1], c[0]))
      )
    case MODIFY_STREETS:
      return flatMap(m.polygons, (polygon) =>
        polygon.map((c: GeoJSON.Position) => new LatLng(c[1], c[0]))
      )
    case ADD_TRIP_PATTERN:
      return coordsFromSegments(m.segments)
    case REROUTE:
      return [
        ...coordsFromSegments(m.segments),
        ...coordsFromPatterns(patterns)
      ]
    default:
      return coordsFromPatterns(patterns)
  }
}

export default function useModificationBounds(
  bundle: CL.Bundle,
  modification: CL.Modification
) {
  const patterns = useRoutePatterns(
    bundle._id,
    get(modification, 'feed'),
    get(modification, 'routes[0]')
  )
  return useMemo(() => {
    const coords = getCoordinatesFromModification(modification, patterns)
    if (coords.length > 1) {
      return latLngBounds(coords)
    }
  }, [modification, patterns])
}
