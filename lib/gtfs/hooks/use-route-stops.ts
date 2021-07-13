import {useMemo} from 'react'

import useRoutePatterns from './use-route-patterns'
import useFeedStops from './use-feed-stops'

/**
 * Get all of the unique stops for a given route via it's patterns and trips.
 */
export default function useRouteStops(
  bundleId: string,
  feedId: string,
  routeId: string
) {
  const patterns = useRoutePatterns(bundleId, feedId, routeId)
  const stops = useFeedStops(bundleId, feedId)
  return useMemo(() => {
    if (stops.length === 0 || patterns.length === 0) return []
    const uniqueIds = new Set<string>()
    const uniqueStops: GTFS.Stop[] = []
    for (const pattern of patterns) {
      for (const stopId of pattern.orderedStopIds) {
        if (uniqueIds.has(stopId)) continue
        const stop = stops.find((s) => s.id === stopId)
        if (stop) uniqueStops.push(stop)
      }
    }
    return uniqueStops
  }, [patterns, stops])
}
