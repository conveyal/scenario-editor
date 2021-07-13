import {useMemo} from 'react'
import type {GeoJSON} from 'geojson'

import KeyedGeoJSON from './geojson'

const toGeoJSON = (patterns: GTFS.Pattern[]): GeoJSON => ({
  type: 'FeatureCollection',
  features: patterns.map((pat) => ({
    type: 'Feature',
    geometry: pat.geometry,
    properties: {
      // TODO add pattern properties
    }
  }))
})

/**
 * Display patterns as GeoJSON on Leaflet.
 */
export default function Patterns({
  color,
  patterns
}: {
  color: string
  patterns: GTFS.Pattern[]
}) {
  const geometry = useMemo<GeoJSON>(() => toGeoJSON(patterns), [patterns])
  return <KeyedGeoJSON data={geometry} color={color} weight={3} />
}
