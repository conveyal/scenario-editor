// @flow
/**
 * API URLs
 */
export const URL_BASE_PATH = '/api'
export const ANALYSIS_URL = `${URL_BASE_PATH}/analysis`

/**
 * Line Editing and display
 */
export const NEW_LINE_WEIGHT = 3
export const HIGHLIGHTED_LINE_WEIGHT = NEW_LINE_WEIGHT * 2
export const NEW_STOP_RADIUS = 2.5

/**
 * Modification types
 */
export const ADD_TRIP_PATTERN = 'add-trip-pattern'
export const ADJUST_DWELL_TIME = 'adjust-dwell-time'
export const ADJUST_SPEED = 'adjust-speed'
export const CONVERT_TO_FREQUENCY = 'convert-to-frequency'
export const REMOVE_STOPS = 'remove-stops'
export const REMOVE_TRIPS = 'remove-trips'
export const REROUTE = 'reroute'
export const MODIFICATION_TYPES = [
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
]

/**
 * Default values
 */
export const DEFAULT_ADD_STOPS_DWELL = 0
export const DEFAULT_ADJUST_DWELL_TIME_VALUE = 30
export const DEFAULT_ADJUST_SPEED_SCALE = 1
export const DEFAULT_STOP_SPACING_METERS = 400
export const MINIMUM_SNAP_STOP_ZOOM_LEVEL = 12
export const MINIMUM_STOP_SPACING = 50

/**
 * Map states
 */
export const MAP_STATE_TRANSIT_EDITOR = 'map state transit editor'
export const MAP_STATE_HIGHLIGHT_SEGMENT = 'map state highlight segment'
export const MAP_STATE_HIGHLIGHT_STOP = 'map state highlight stop'
export const MAP_STATE_HOP_SELECTION = 'map state hop selection'
export const MAP_STATE_STOP_SELECTION = 'map state stop selection'
export const MAP_STATE_SINGLE_STOP_SELECTION = 'map state single stop selection'
export const MAP_STATE_SELECT_FROM_STOP = 'map state select from stop'
export const MAP_STATE_SELECT_TO_STOP = 'map state select to stop'

/**
 * Update delay so that we can batch updates to the server with debounce
 */
export const UPDATE_DELAY_MS = 1000

/**
 * For autosaving modifications.
 */
export const AUTOSAVE_EVERY_MS = 10 * 1000

/**
 * Percentiles of travel time to request from the backend. This is for
 * TRAVEL_TIME_SURFACE requests.
 */
export const TRAVEL_TIME_PERCENTILES = [5, 25, 50, 75, 95]

/**
 * Default Profile Request object
 */
export const PROFILE_REQUEST_DEFAULTS = {
  accessModes: 'WALK',
  bikeSpeed: 4.166666666666667,
  date: new Date().toISOString().split('T')[0],
  directModes: 'WALK',
  egressModes: 'WALK',
  fromTime: 25200,
  maxRides: 4,
  maxTripDurationMinutes: 60,
  monteCarloDraws: 200,
  percentiles: TRAVEL_TIME_PERCENTILES,
  toTime: 32400,
  transitModes: 'BUS,TRAM,RAIL,SUBWAY',
  travelTimePercentile: 50,
  walkSpeed: 1.3888888888888888,
  variantIndex: 0
}
