// @flow
import toStartCase from 'lodash/startCase'

import {
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  DEFAULT_ADD_STOPS_DWELL,
  DEFAULT_ADJUST_DWELL_TIME_VALUE,
  DEFAULT_ADJUST_SPEED_SCALE,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from '../constants'

export function create ({
  feedId,
  name,
  projectId,
  type,
  variants
}: {
  feedId?: string,
  name?: string,
  projectId: string,
  type: string,
  variants: boolean[]
}): any {
  const base = {
    name: name || toStartCase(type),
    projectId,
    showOnMap: true,
    type,
    variants
  }
  switch (type) {
    case REROUTE:
      return {
        ...base,
        dwellTime: DEFAULT_ADD_STOPS_DWELL,
        fromStop: null,
        routes: null,
        segments: [],
        feed: feedId,
        segmentSpeeds: [],
        toStop: null
      }
    case ADD_TRIP_PATTERN:
      return {
        ...base,
        bidirectional: true,
        segments: [],
        timetables: []
      }
    case ADJUST_DWELL_TIME:
      return {
        ...base,
        routes: null,
        scale: false,
        feed: feedId,
        stops: null,
        trips: null,
        value: DEFAULT_ADJUST_DWELL_TIME_VALUE
      }
    case ADJUST_SPEED:
      return {
        ...base,
        hops: null,
        feed: feedId,
        routes: null,
        scale: DEFAULT_ADJUST_SPEED_SCALE,
        trips: null
      }
    case CONVERT_TO_FREQUENCY:
      return {
        ...base,
        entries: [],
        feed: feedId,
        routes: null
      }
    case REMOVE_STOPS:
      return {
        ...base,
        routes: null,
        feed: feedId,
        stops: null,
        trips: null
      }
    case REMOVE_TRIPS:
      return {
        ...base,
        routes: null,
        feed: feedId,
        trips: null
      }
    default:
      throw new Error(`Modification type "${type}" does not exist.`)
  }
}

export function formatForServer (modification: any) {
  const copy = Object.assign({}, modification)
  const feedIsObject = copy.feed && copy.feed.id
  const routesAreObjects = copy.routes && copy.routes[0] && copy.routes[0].id
  const stopsAreObjects = copy.stops && copy.stops[0] && copy.stops[0].id
  const tripsAreObjects = copy.trips && copy.trips[0] && copy.trips[0].id

  if (feedIsObject) copy.feed = copy.feed.id
  if (routesAreObjects) copy.routes = copy.routes.map(route => route.id)
  if (stopsAreObjects) copy.stops = copy.stops.map(stop => stop.id)
  if (tripsAreObjects) copy.trips = copy.trips.map(trip => trip.id)

  return copy
}

export function isValid (modification: any) {
  const isModificationWithSegments =
    (modification.type === ADD_TRIP_PATTERN || modification.type === REROUTE) &&
    modification.segments
  // confirm that the first geometry is a line string unless it's the only geometry
  if (isModificationWithSegments && modification.segments.length > 1) {
    for (const segment of modification.segments) {
      if (segment.geometry.type !== 'LineString') {
        throw new Error(`Expected linestring geometry, got ${segment.geometry.type}`)
      }
    }

    for (let segIdx = 1; segIdx < modification.segments.length; segIdx++) {
      const s0 = modification.segments[segIdx - 1]
      const s1 = modification.segments[segIdx]
      if (s0.stopAtEnd !== s1.stopAtStart) {
        throw new Error(
          `End stop flag does not match start stop flag of next segment at ${segIdx - 1}`
        )
      }

      if (s0.toStopId !== s1.fromStopId) {
        throw new Error(
          `End stop ID does not match start stop ID of next segment at ${segIdx - 1}`
        )
      }

      const coord0 = s0.geometry.coordinates.slice(-1)[0]
      const coord1 = s1.geometry.coordinates[0]
      const epsilon = 1e-6

      if (
        Math.abs(coord0[0] - coord1[0]) > epsilon ||
        Math.abs(coord0[1] - coord1[1]) > epsilon
      ) {
        throw new Error(`End coordinate does not match start coordinate of next segment at ${segIdx - 1}`)
      }
    }
  }

  // phew, all good
  return true
}
