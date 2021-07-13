import {useMemo} from 'react'
import {GeoJSON, GeoJSONProps} from 'react-leaflet'

let keyIndex = 0
const nextKey = () => keyIndex++
const EMPTY_DATA = []

/**
 * Increment the render count when the data or style changes to replace the entire underlying GeoJSON component.
 */
export default function KeyedGeoJSON({data, style, ...p}: GeoJSONProps) {
  const key = useMemo(() => nextKey(), [data, style]) // eslint-disable-line
  return <GeoJSON data={data ?? EMPTY_DATA} key={key} style={style} {...p} />
}
