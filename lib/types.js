
export type LonLat = {
  lon: number,
  lat: number
}

/**
 * GeoJSON types
 */
export type Coordinate = [number, number]

export type Feature = {

}

export type Point = {
  x: number,
  y: number
}

export type FeatureCollection = {
  type: 'FeatureCollection',
  features: Feature[]
}

export type LineString = {
  type: 'LineString',
  coordinates: Coordinate[]
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

export type Feed = {}

export type MapState = {}

export type Modification = {}

export type ADD_TRIP_PATTERN = 'add-trip-pattern'
export type ADJUST_DWELL_TIME = 'adjust-dwell-time'
export type ADJUST_SPEED = 'adjust-speed'
export type CONVERT_TO_FREQUENCY = 'convert-to-frequency'
export type REMOVE_STOPS = 'remove-stops'
export type REMOVE_TRIPS = 'remove-trips'
export type REROUTE = 'reroute'
export type ModificationType = ADD_TRIP_PATTERN
  | ADJUST_DWELL_TIME
  | ADJUST_SPEED
  | CONVERT_TO_FREQUENCY
  | REMOVE_STOPS
  | REMOVE_TRIPS
  | REROUTE

export type Pattern = {
  geometry: any
}

export type Route = {}

export type Segment = {
  fromStopId: string,
  geometry: LineString,
  spacing: number,
  stopAtEnd: boolean,
  stopAtStart: boolean,
  toStopId?: string
}

export type ProfileRequest = {
  accessModes: string[],
  directModes: string[],
  fromTime: number,
  toTime: number,
  fromLat: number,
  fromLon: number
}

export type Stop = {
  center: Coordinate,
  stopId: string,
  index: number,
  lat: number,
  lon: number,
  bearing: number,
  autoCreated: boolean,
  distanceFromStart: number
}

export type Timetable = {
  segmentSpeeds: number[]
}

export type Bounds = {
  north: number,
  east: number,
  south: number,
  west: number
}

export type Project = {
  name: string,
  id: string,
  description: string,
  r5Version: string,
  bounds: Bounds,
  group: string,
  loadStatus: ?string,
  bundles: any[],
  bookmarks: any[],
  indicators: any[]
}
