/** export a reroute modification */

import assert from 'assert'

import {feedScopeIds} from './'
import getHopTimes from '../get-hop-times'
import getStops from '../get-stops'

export default function convertReroute ({
  dwell,
  feed,
  fromStop,
  routes,
  segments,
  speed,
  toStop,
  trips
}) {
  // feed-scope IDs
  const fromStopId = fromStop ? `${feed}:${fromStop}` : null
  const toStopId = toStop ? `${feed}:${toStop}` : null
  let feedScopedPatterns, feedScopedRoutes
  if (trips) {
    feedScopedPatterns = feedScopeIds(feed, trips)
  } else {
    feedScopedRoutes = feedScopeIds(feed, routes)
  }

  const segmentStops = getStops(segments)
  const stops = segmentStops.map((stop) => {
    // already feed scoped
    if (stop.stopId) {
      return { id: stop.stopId }
    } else {
      return {
        lat: stop.lat,
        lon: stop.lon
      }
    }
  })

  // don't include from and to stop in modification
  if (fromStop) {
    const stop = stops.shift()
    assert(stop.id === fromStopId, 'First stop in reroute is not fromStop!')
  }

  if (toStop) {
    const stop = stops.pop()
    assert(stop.id === toStopId, 'Last stop in reroute is not toStop!')
  }

  const hopTimes = getHopTimes(segmentStops, speed)

  // There should be one more dwell time than hop time. The number of hop times depends on fromStop and toStop.
  const dwellTimes = hopTimes.map((hop) => dwell)
  dwellTimes.push(dwell)

  return {
    fromStop: fromStopId,
    dwellTimes,
    hopTimes,
    patterns: feedScopedPatterns,
    routes: feedScopedRoutes,
    stops,
    toStop: toStopId,
    type: 'reroute'
  }
}
