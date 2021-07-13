import {get} from 'lodash'
import {useMemo} from 'react'

import {useRouteStops, useRoutePatterns} from 'lib/gtfs/hooks'
import intersects from 'lib/utils/arrays-intersect'

export default function useHopStops(
  bundleId: string,
  modification: CL.AdjustSpeed
): GTFS.Stop[][] {
  const routeId = get(modification, 'routes[0]')
  const stops = useRouteStops(bundleId, modification.feed, routeId)
  const patterns = useRoutePatterns(bundleId, modification.feed, routeId)

  return useMemo(() => {
    if (patterns.length === 0 || stops.length === 0) return []
    const filteredPatterns =
      modification.trips?.length > 0
        ? patterns.filter((p) =>
            intersects(p.associatedTripIds, modification.trips)
          )
        : patterns
    const hopsForPattern = filteredPatterns.flatMap((p) =>
      p.orderedStopIds.map((stopId, index, array) =>
        index < array.length - 1 ? [stopId, array[index + 1]] : null
      )
    )

    // Smoosh hops from all patterns together
    const candidateHops = hopsForPattern.filter((hop) => hop != null)

    return candidateHops.map((hop) => [
      stops.find((s) => s.id === hop[0]),
      stops.find((s) => s.id === hop[1])
    ])
  }, [patterns, modification.trips, stops])
}
