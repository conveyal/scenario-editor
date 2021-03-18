import {RECOMMENDED_R5_VERSION} from 'lib/modules/r5-version/constants'

export const ENV = process.env.NODE_ENV
export const MB_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
export const isServer = typeof window === 'undefined'
export const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

/**
 * Logo
 */
export const LOGO_URL = '/img/conveyal-128x128.png'
export const CB_HEX = '#2389c9'
export const CB_DARK = '#185c86'
export const CB_RGB = {r: 35, g: 137, b: 201}

/**
 * Maximum upload sizes
 */
const MB = (b: number): number => b * 1024 * 1024
// Java API
// Dictated by the reverse proxy used on the server.
export const SERVER_MAX_FILE_SIZE_BYTES = MB(500)
// JavaScript API
// https://vercel.com/docs/platform/limits?query=limit#serverless-function-payload-size-limit
export const VERCEL_MAX_FILE_SIZE_BYTES = MB(5)

/**
 * API URLs
 */
export const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`

export const API = {
  Activity: `${API_URL}/activity`,
  Analysis: `${API_URL}/analysis`,
  Bundle: `${API_URL}/bundle`,
  GraphQL: `${API_URL}/graphql`,
  Jobs: `${API_URL}/jobs`,
  Modification: `${API_URL}/modification`,
  Opportunities: `${API_URL}/opportunities`,
  Project: `${API_URL}/project`,
  Region: `${API_URL}/region`,
  Regional: `${API_URL}/regional`,
  Resources: `${API_URL}/resources`,
  Timetables: `${API_URL}/timetables`,
  Workers: `${API_URL}/workers`
}
export const ANALYSIS_URL = `${API_URL}/analysis`

/**
 * Pages
 */
export const Pages = {
  changelog: '/changelog',
  regions: '/',
  regionCreate: '/regions/create',
  regionSettings: '/regions/[regionId]/edit',
  project: '/regions/[regionId]/projects/[projectId]',
  projects: '/regions/[regionId]',
  projectCreate: '/regions/[regionId]/create-project',
  projectSettings: '/regions/[regionId]/projects/[projectId]/edit',
  projectSelect: '/regions/[regionId]/projects',
  report: '/report',
  bundles: '/regions/[regionId]/bundles',
  bundleCreate: '/regions/[regionId]/bundles/create',
  bundleEdit: '/regions/[regionId]/bundles/[bundleId]',
  opportunities: '/regions/[regionId]/opportunities',
  opportunitiesUpload: '/regions/[regionId]/opportunities/upload',
  importShapefile: '/regions/[regionId]/projects/[projectId]/import-shapefile',
  modificationEdit:
    '/regions/[regionId]/projects/[projectId]/modifications/[modificationId]',
  modificationImport:
    '/regions/[regionId]/projects/[projectId]/import-modifications',
  modifications: '/regions/[regionId]/projects/[projectId]/modifications',
  analysis: '/regions/[regionId]/analysis',
  regionalAnalyses: '/regions/[regionId]/regional',
  regionalAnalysis: '/regions/[regionId]/regional/[analysisId]',
  login: '/api/login',
  logout: '/api/logout',
  authCallback: '/api/callback',
  resources: '/regions/[regionId]/resources',
  resourceUpload: '/regions/[regionId]/resources/upload',
  resourceEdit: '/regions/[regionId]/resources/[resourceId]'
}
export type PageKey = keyof typeof Pages

/**
 * Local Storage Keys
 */
export const LS_MOM = 'modifications-on-map'

/**
 * Map
 */
export const PROJECTION_ZOOM_LEVEL = 9

/**
 * Line Editing and display
 */
export const NEW_LINE_WEIGHT = 3
export const HIGHLIGHTED_LINE_WEIGHT = NEW_LINE_WEIGHT * 2
export const NEW_STOP_RADIUS = 2.5

/**
 * Modification types
 */
export const ADD_STREETS = 'add-streets'
export const ADD_TRIP_PATTERN = 'add-trip-pattern'
export const ADJUST_DWELL_TIME = 'adjust-dwell-time'
export const ADJUST_SPEED = 'adjust-speed'
export const CONVERT_TO_FREQUENCY = 'convert-to-frequency'
export const CUSTOM_MODIFICATION = 'custom'
export const MODIFY_STREETS = 'modify-streets'
export const REMOVE_STOPS = 'remove-stops'
export const REMOVE_TRIPS = 'remove-trips'
export const REROUTE = 'reroute'
export const MODIFICATION_TYPES = [
  ADD_STREETS,
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  MODIFY_STREETS,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE,
  CUSTOM_MODIFICATION
]

/**
 * Transit Modes
 */
export const BUS = 'BUS'
export const RAIL = 'RAIL'
export const TRAM = 'TRAM'
export const SUBWAY = 'SUBWAY'
export const FERRY = 'FERRY'
export const CABLE_CAR = 'CABLE_CAR'
export const GONDOLA = 'GONDOLA'
export const FUNICULAR = 'FUNICULAR'

// The mode index corresponds to the GTFS route_type integer
export const ALL_TRANSIT_MODES = [
  TRAM,
  SUBWAY,
  RAIL,
  BUS,
  FERRY,
  CABLE_CAR,
  GONDOLA,
  FUNICULAR
]

/**
 * Street modes
 */
export const BICYCLE = 'BICYCLE'
export const CAR = 'CAR'
export const WALK = 'WALK'
export const ALL_STREET_MODES = [BICYCLE, CAR, WALK]

/**
 * Fetch types
 */
export const FETCH_TRAVEL_TIME_SURFACE = 'FETCH_TRAVEL_TIME_SURFACE'

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
  bikeTrafficStress: 4,
  date:
    process.env.NODE_ENV === 'test'
      ? '2020-06-10'
      : new Date().toISOString().split('T')[0],
  decayFunction: {
    type: 'step',
    standardDeviationMinutes: 10,
    widthMinutes: 10
  },
  destinationPointSetIds: [],
  directModes: 'WALK',
  egressModes: 'WALK',
  fromTime: 25200,
  maxBikeTime: 20,
  maxRides: 4,
  maxWalkTime: 20,
  monteCarloDraws: 200,
  percentiles: TRAVEL_TIME_PERCENTILES,
  toTime: 32400,
  transitModes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,CABLE_CAR,GONDOLA,FUNICULAR',
  walkSpeed: 1.3888888888888888,
  workerVersion: RECOMMENDED_R5_VERSION,
  variantIndex: -1
}

export const UNDEFINED_PROJECT_NAME = 'Not set'
