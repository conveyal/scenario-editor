import {ADD_TRIP_PATTERN, REROUTE} from '../constants'

export function formatForServer(modification) {
  const copy = {...modification}
  const feedIsObject = copy.feed && copy.feed.id
  const routesAreObjects = copy.routes && copy.routes[0] && copy.routes[0].id
  const stopsAreObjects = copy.stops && copy.stops[0] && copy.stops[0].id
  const tripsAreObjects = copy.trips && copy.trips[0] && copy.trips[0].id

  if (feedIsObject) copy.feed = copy.feed.id
  if (routesAreObjects) copy.routes = copy.routes.map((route) => route.id)
  if (stopsAreObjects) copy.stops = copy.stops.map((stop) => stop.id)
  if (tripsAreObjects) copy.trips = copy.trips.map((trip) => trip.id)

  return copy
}

export function validateSegments(segments) {
  for (const segment of segments) {
    if (segment.geometry.type !== 'LineString') {
      return `Expected lineString geometry, got ${segment.geometry.type}`
    }
  }

  for (let segIdx = 1; segIdx < segments.length; segIdx++) {
    const s0 = segments[segIdx - 1]
    const s1 = segments[segIdx]
    if (s0.stopAtEnd !== s1.stopAtStart) {
      return `End stop flag does not match start stop flag of next segment at ${
        segIdx - 1
      }`
    }

    if (s0.toStopId !== s1.fromStopId) {
      return `End stop ID does not match start stop ID of next segment at ${
        segIdx - 1
      }`
    }

    const coord0 = s0.geometry.coordinates.slice(-1)[0]
    const coord1 = s1.geometry.coordinates[0]
    const epsilon = 1e-6

    if (
      Math.abs(coord0[0] - coord1[0]) > epsilon ||
      Math.abs(coord0[1] - coord1[1]) > epsilon
    ) {
      return `End coordinate does not match start coordinate of next segment at ${
        segIdx - 1
      }`
    }
  }
}

export function isValid(modification) {
  const isModificationWithSegments =
    (modification.type === ADD_TRIP_PATTERN || modification.type === REROUTE) &&
    modification.segments
  // confirm that the first geometry is a line string unless it's the only geometry
  if (isModificationWithSegments && modification.segments.length > 1) {
    const segmentStatus = validateSegments(modification.segments)
    if (typeof segmentStatus === 'string') {
      throw new Error(segmentStatus)
    }
  }

  // phew, all good
  return true
}
