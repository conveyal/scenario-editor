import toStartCase from 'lodash/startCase'

import {
  ADD_STREETS,
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  ALL_STREET_MODES,
  CONVERT_TO_FREQUENCY,
  CUSTOM_MODIFICATION,
  MODIFY_STREETS,
  DEFAULT_ADD_STOPS_DWELL,
  DEFAULT_ADJUST_DWELL_TIME_VALUE,
  DEFAULT_ADJUST_SPEED_SCALE,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from 'lib/constants'

type Create = {
  feedId?: string
  name?: string
  projectId: string
  type: string
}

export function createAddTripPattern({name, projectId, variants = []}) {
  return {
    name,
    projectId,
    bidirectional: true,
    segments: [],
    variants,
    timetables: [],
    type: ADD_TRIP_PATTERN,
    transitMode: 3 // BUS, same as the R5 default
  }
}

export function withDefaultValues({feedId, name, projectId, type}: Create) {
  const base = {
    name: name ?? toStartCase(type),
    projectId,
    type
  }
  switch (type) {
    case ADD_STREETS:
      return {
        ...base,
        allowedModes: ALL_STREET_MODES,
        bikeTimeFactor: 1,
        bikeLts: 1,
        carSpeedKph: 30,
        lineStrings: [],
        walkTimeFactor: 1
      }
    case MODIFY_STREETS:
      return {
        ...base,
        allowedModes: ALL_STREET_MODES,
        bikeTimeFactor: 1,
        bikeLts: 1,
        carSpeedKph: 30,
        polygons: [],
        walkTimeFactor: 1
      }
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
      return createAddTripPattern(base)
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
    case CUSTOM_MODIFICATION:
      return {
        ...base,
        r5type: ''
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
      return base
  }
}
