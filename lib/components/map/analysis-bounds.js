import lonlat from '@conveyal/lonlat'
import React from 'react'
import {Rectangle} from 'react-leaflet'

/**
 * Unproject the analysis bounds into `Leaflet.LatLng` points to be used for a
 * rectangle. NB code was copied from another location that also incremented
 * `west` by 1. Possibly to ensure non-zero numbers.
 */
function getAnalysisBounds(analysis) {
  const {north, west, width, height, zoom} = analysis
  const nw = lonlat.fromPixel({x: west + 1, y: north}, zoom)
  const se = lonlat.fromPixel({x: west + width + 1, y: north + height}, zoom)
  return [lonlat.toLeaflet(nw), lonlat.toLeaflet(se)]
}

export default function AnalysisBounds(p) {
  return <Rectangle bounds={getAnalysisBounds(p.analysis)} weight={2} />
}
