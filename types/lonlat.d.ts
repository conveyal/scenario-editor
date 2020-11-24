declare module '@conveyal/lonlat' {
  import type {LatLng, LatLngLiteral} from 'leaflet'

  export type LonLatCompatible =
    | CL.LonLat
    | CL.Point
    | GeoJSON.Position
    | LatLng
    | LatLngLiteral

  interface ILonLat {
    (input: LonLatCompatible): CL.LonLat
    fromLeaflet(input: LatLng): CL.LonLat
    fromPixel(pixel: CL.Point, zoom?: number): CL.LonLat
    isEqual(
      l1: LonLatCompatible,
      l1: LonLatCompatible,
      tolerance?: number
    ): boolean
    toCoordinates(input: LonLatCompatible): GeoJSON.Position
    toLeaflet(input: LonLatCompatible): LatLng
    toPixel(input: LonLatCompatible, zoom?: number): CL.Point
    toString(input: LonLatCompatible): string
  }

  const LonLat: ILonLat

  export default LonLat
}
