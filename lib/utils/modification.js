import dbg from 'debug'
import toCapitalCase from 'to-capital-case'
import uuid from 'uuid'

import {ADD_TRIP_PATTERN, ADJUST_DWELL_TIME, ADJUST_SPEED, CONVERT_TO_FREQUENCY, REMOVE_STOPS, REMOVE_TRIPS, REROUTE} from './modification-types'

const debug = dbg('scenario-editor:modification')

const DEFAULT_ADD_STOPS_DWELL = 0
const DEFAULT_ADD_STOPS_SPEED = 15
const DEFAULT_ADJUST_DWELL_TIME_VALUE = 30
const DEFAULT_ADJUST_SPEED_SCALE = 1

export function create ({
  feedId,
  scenarioId,
  type,
  variants
}) {
  const base = {
    expanded: false,
    id: uuid.v4(),
    name: toCapitalCase(type),
    scenario: scenarioId,
    showOnMap: true,
    type,
    variants
  }
  switch (type) {
    case REROUTE:
      return {
        ...base,
        dwell: DEFAULT_ADD_STOPS_DWELL,
        fromStop: null,
        routes: null,
        segments: [],
        feed: feedId,
        speed: DEFAULT_ADD_STOPS_SPEED,
        toStop: null
      }
    case ADD_TRIP_PATTERN:
      return {
        ...base,
        segments: [],
        speeds: [],
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
  }
}

export function formatForServer (modification) {
  const copy = Object.assign({}, modification)
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

export function isValid (modification) {
  // confirm that the first geometry is a line string unless it's the only geometry
  if (modification.segments.length > 1) {
    for (let segment of modification.segments) {
      if (segment.geometry.type !== 'LineString') {
        debug(`Expected linestring geometry, got ${segment.geometry.type}`)
        return false
      }
    }

    for (let segIdx = 1; segIdx < modification.segments.length; segIdx++) {
      const s0 = modification.segments[segIdx - 1]
      const s1 = modification.segments[segIdx]
      if (s0.stopAtEnd !== s1.stopAtStart) {
        debug(`End stop flag does not match start stop flag of next segment at ${segIdx - 1}`)
        return false
      }

      if (s0.toStopId !== s1.fromStopId) {
        debug(`End stop ID does not match start stop ID of next segment at ${segIdx - 1}`)
        return false
      }

      const coord0 = s0.geometry.coordinates.slice(-1)[0]
      const coord1 = s1.geometry.coordinates[0]
      const epsilon = 1e-6

      if (Math.abs(coord0[0] - coord1[0]) > epsilon || Math.abs(coord0[1] - coord1[1]) > epsilon) {
        debug(`End coordinate does not match start coordinate of next segment at ${segIdx - 1}`)
        return false
      }
    }
  }

  // phew, all good
  return true
}
