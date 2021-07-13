declare namespace GTFS {
  export type Pattern = {
    associatedTripIds: string[]
    id: string
    geometry: GeoJSON.LineString
    name: string
    orderedStopIds: string[]
  }

  export type Stop = {
    id: string
    lat: number
    lon: number
    name: string
  }

  export type FeedStops = {
    feedId: string
    stops: Stop[]
  }

  export type FeedScopedStop = Stop & {
    feedId: string
    scopedId: string
  }

  export type Route = {
    color: string
    id: string
    name: string
    type: number
  }

  export type Trip = {
    directionId: number
    duration: number
    headsign: string
    id: string
    name: string
    startTime: number
  }
}
