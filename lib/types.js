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
  lon: number,
  lat: number
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
  type: 'FeatureCollection',
  features: Feature[]
}

export type LineString = {
  type: 'LineString',
  coordinates: number[][]
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

export type Bundle = Model & {
  feeds: Array<{
    checksum: string,
    feedId: string,
    name: string
  }>,
  regionId: string,
  totalFeeds: number
}

export type Project = Model & {
  name: string
}

export type MapState = {
  activeTrips?: number[],
  action?: string,
  followRoad?: boolean,
  state: null | string
}

export type Timetable = {
  _id: string,
  dwellTime: number,
  dwellTimes?: number[],
  name: string,
  headwaySecs: number,
  phaseFromTimetable: string,
  phaseFromStop: string,
  phaseAtStop: null | string,
  phaseSeconds: number,
  segmentSpeeds: number[],
  startTime: number,
  endTime: number,
  exactTimes: boolean,
  modificationId: string,
  modificationName: string
}

export type Pattern = {
  geometry: any
}

export type Route = {
  label: string,
  route_id: string,
  patterns: any[]
}

export type Trip = {
  duration: number,
  trip_id: string,
  start_time: number,
  end_time: number,
  trip_short_name: string,
  trip_headsign: string
}

export type RoutePattern = {
  name: string,
  pattern_id: string,
  trips: Trip[],
  geometry?: any
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
  description: string,
  projectId: string,
  showOnMap: boolean,
  type: ModificationType,
  variants: boolean[],

  // Only some have these
  bidirectional?: boolean,
  dwellTime?: number,
  entries?: Timetable[],
  feed?: string,
  fromStop?: string,
  hopes?: number,
  retainTripsOutsideFrequencyEntries?: boolean,
  routes?: string[],
  scale?: boolean,
  secondsSavedAtEachStop?: number,
  segments?: Segment[],
  segmentSpeeds?: number[],
  stops?: string[],
  timetables?: Timetable[],
  toStop?: string,
  trips?: string[],
  value?: number
}

export type ProfileRequest = {
  accessModes: string,
  egressModes: string,
  directModes: string,
  fromTime: number,
  toTime: number,
  fromLat: number,
  fromLon: number,
  transitModes: string,
  travelTimePercentile: number,
  variantIndex: number
}

export type Bookmark = Model & {
  opportunityDataset: string,
  isochroneCutoff: number,
  profileRequest: ProfileRequest,
  regionId: string
}

export type Stop = {
  stopId: void | string,
  index: number,
  lat: number,
  lon: number,
  autoCreated: boolean,
  distanceFromStart: number
}

export type Bounds = {
  north: number,
  east: number,
  south: number,
  west: number
}

export type Region = Model & {
  description: string,
  bounds: Bounds,
  statusCode?: string,
  bundles?: any[],
  bookmarks?: any[],
  opportunityDatasets: any[]
}

// Analysis types
export type AggregationArea = {
  _id: string,
  name: string
}

export type AggregateAccessibility = {
  weightedAverage: number,
  minAccessibility: number,
  maxAccessibility: number,
  percentiles: number[],
  bins: {
    min: number,
    max: number,
    value: number
  }[]
}

export type Grid = {
  zoom: number,
  width: number,
  height: number,
  west: number,
  north: number,
  data: number[],
  min: number,
  contains(x: number, y: number): boolean
}

export type Surface = {
  zoom: number,
  west: number,
  north: number,
  width: number,
  height: number,
  nSamples: number,
  errors: string[],
  warnings: string[],
  get: (x: number, y: number) => number[]
}

export type OpportunityDataset = {
  key: string,
  name: string
}

export type RegionalAnalysis = Model & {
  zoom: number,
  width: number,
  height: number,
  north: number,
  west: number,
  request: any, // TODO
  workerVersion: string,
  bundleId: string,
  bounds: any, // TODO geojson geometry

  // assigned by server
  complete: ?boolean,
  projectId: ?string,
  deleted: ?boolean,
  status: string,
  grid: string,
  cutoffMinutes: number,
  travelTimePercentile: number
}

export type Quintiles = {
  low: number,
  iqrLow: number,
  med: number,
  iqrHigh: number,
  high: number
}

export type TravelTimeSurface = {
  nSamples: number,
  north: number,
  west: number,
  height: number,
  width: number,
  get: (number, number) => number[]
}

/**
 * Redux
 */

export type State = any // TODO Fill this in
export type GetState = () => State
