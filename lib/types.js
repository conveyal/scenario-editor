// @flow
/* eslint-disable no-use-before-define */
import type {LatLng} from 'leaflet'

export type Model = {
  _id: string,
  accessGroup: string,
  createdAt: string,
  createdBy: string,
  name: string,
  nonce: string,
  updatedAt: string,
  updatedBy: string,
}

export type LonLat = {
  lat: number,
  lon: number
}

export type Coordinates = [number, number] // [lon, lat]

export type Point = {
  x: number,
  y: number
}

// All lonlat compatible forms, LatLng contains the Coordinates case
export type LonLatC = LonLat | Point | LatLng

export type ReactSelectResult = {
  label: string,
  value: string
}

export type ClearableReactSelectResult = null | ReactSelectResult

export type ReactSelectMultiResult = ReactSelectResult[]

export type ClearableReactSelectMultiResult = null | ReactSelectMultiResult

/**
 * GeoJSON types
 */
export type Geometry = {
  coordinates: number[][],
  type?: string
}

export type Feature = {
  geometry: Geometry
}

export type FeatureCollection = {
  features: Feature[],
  type: 'FeatureCollection'
}

export type LineString = {
  coordinates: number[][],
  type: 'LineString'
}

/**
 * GTFS Types
 */
export type GTFSStop = {
  stop_id: string,
  stop_lat: number,
  stop_lon: number,
  stop_name: string
}

export type Feed = {
  checksum: string,
  id: string,
  routes: Route[],
  stops: any[],
  stopsById: Object
}

export type FeedsById = {
  [id: string]: Feed
}

export type Bundle = Model & {
  errorCode: string,
  feeds: Array<{
    checksum: string,
    feedId: string,
    name: string
  }>,
  regionId: string,
  status: string,
  totalFeeds: number
}

export type Project = Model & {
  name: string
}

export type MapState = {
  action?: string,
  activeTrips?: number[],
  followRoad?: boolean,
  state: null | string
}

export type Timetable = {
  _id: string,
  dwellTime: number,
  dwellTimes?: number[],
  endTime: number,
  exactTimes: boolean,
  headwaySecs: number,
  modificationId: string,
  modificationName: string,
  name: string,
  phaseAtStop: null | string,
  phaseFromStop: string,
  phaseFromTimetable: string,
  phaseSeconds: number,
  segmentSpeeds: number[],
  startTime: number
}

export type Pattern = {
  geometry: any
}

export type Route = {
  label: string,
  patterns: any[],
  route_id: string
}

export type Trip = {
  duration: number,
  end_time: number,
  start_time: number,
  trip_headsign: string,
  trip_id: string,
  trip_short_name: string
}

export type RoutePattern = {
  geometry?: any,
  name: string,
  pattern_id: string,
  trips: Trip[]
}

export type RoutePatterns = RoutePattern[]

export type Segment = {
  fromStopId?: string,
  geometry: any,
  spacing: number,
  stopAtEnd: boolean,
  stopAtStart: boolean,
  toStopId?: string
}

/**
 * Modifications
 */
export type ADD_TRIP_PATTERN = 'add-trip-pattern'
export type ADJUST_DWELL_TIME = 'adjust-dwell-time'
export type ADJUST_SPEED = 'adjust-speed'
export type CONVERT_TO_FREQUENCY = 'convert-to-frequency'
export type REMOVE_STOPS = 'remove-stops'
export type REMOVE_TRIPS = 'remove-trips'
export type REROUTE = 'reroute'
export type ModificationType =
  | ADD_TRIP_PATTERN
  | ADJUST_DWELL_TIME
  | ADJUST_SPEED
  | CONVERT_TO_FREQUENCY
  | REMOVE_STOPS
  | REMOVE_TRIPS
  | REROUTE

export type Modification = Model & {
  // All modifications have these
  bidirectional?: boolean,
  description: string,
  dwellTime?: number,
  entries?: Timetable[],
  feed?: string,

  // Only some have these
  fromStop?: string,
  hopes?: number,
  projectId: string,
  retainTripsOutsideFrequencyEntries?: boolean,
  routes?: string[],
  scale?: boolean,
  secondsSavedAtEachStop?: number,
  segmentSpeeds?: number[],
  segments?: Segment[],
  showOnMap: boolean,
  stops?: string[],
  timetables?: Timetable[],
  toStop?: string,
  trips?: string[],
  type: ModificationType,
  value?: number,
  variants: boolean[]
}

export type ProfileRequest = {
  accessModes: string,
  bikeSpeed: number,
  bounds: Bounds,
  date: string,
  directModes: string,
  egressModes: string,
  fromLat: number,
  fromLon: number,
  fromTime: number,
  maxBikeTime: number,
  maxRides: number,
  maxWalkTime: number,
  monteCarloDraws: number,
  toTime: number,
  transitModes: string,
  travelTimePercentile: number,
  variantIndex: number,
  walkSpeed: number
}

export type Bookmark = Model & {
  isochroneCutoff: number,
  opportunityDataset: string,
  profileRequest: ProfileRequest,
  regionId: string
}

export type Stop = {
  autoCreated: boolean,
  distanceFromStart: number,
  index: number,
  lat: number,
  lon: number,
  stopId: void | string
}

export type Bounds = {
  east: number,
  north: number,
  south: number,
  west: number
}

export type Region = Model & {
  bookmarks?: any[],
  bounds: Bounds,
  bundles?: any[],
  description: string,
  opportunityDatasets: any[],
  statusCode?: string
}

// Analysis types
export type AggregationArea = {
  _id: string,
  name: string
}

export type AggregateAccessibility = {
  bins: {
    max: number,
    min: number,
    value: number
  }[],
  maxAccessibility: number,
  minAccessibility: number,
  percentiles: number[],
  weightedAverage: number
}

export type Grid = {
  contains: (x: number, y: number) => boolean,
  data: number[],
  height: number,
  min: number,
  north: number,
  west: number,
  width: number,
  zoom: number
}

export type Surface = {
  depth: number,
  errors: string[],
  get: (x: number, y: number) => number[],
  height: number,
  north: number,
  warnings: string[],
  west: number,
  width: number,
  zoom: number
}

export type OpportunityDataset = {
  _id: string,
  name: string
}

export type RegionalAnalysis = Model & {
  bounds: any,
  bundleId: string,
  complete: ?boolean,
  cutoffMinutes: number,
  deleted: ?boolean,
  grid: string, // TODO
  height: number,
  north: number,
  projectId: ?string, // TODO geojson geometry

  // assigned by server
  request: any,
  status: string,
  travelTimePercentile: number,
  west: number,
  width: number,
  workerVersion: string,
  zoom: number
}

export type Quintiles = {
  high: number,
  iqrHigh: number,
  iqrLow: number,
  low: number,
  med: number
}

export type TravelTimeSurface = {
  depth: number,
  get: (number, number, number) => number,
  height: number,
  north: number,
  west: number,
  width: number
}

/**
 * Redux
 */

export type State = any // TODO Fill this in
export type GetState = () => State
