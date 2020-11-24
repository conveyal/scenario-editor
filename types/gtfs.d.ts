declare namespace GTFS {
  export type Stop = {
    stop_id: string
    stop_lat: number
    stop_lon: number
  }

  export type Pattern = {
    name: string
    pattern_id: string
    geometry: GeoJSON.LineString
  }
}
