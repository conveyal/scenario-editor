import lonlat from '@conveyal/lonlat'

import L from 'lib/leaflet'
import message from 'lib/message'

import reprojectCoordinates from './reproject-coordinates'

const ANTIMERIDIAN_WARNING =
  'We do not currently support bounds that cross the antimeridian.'

interface ExtendedBounds extends CL.Bounds {
  toString: () => string
}

export function toLatLngBounds(
  bounds: ExtendedBounds | L.LatLngBounds
): L.LatLngBounds {
  // Check if it's already a leaflet bounds object
  if (bounds instanceof L.LatLngBounds) return bounds
  return new L.LatLngBounds([
    [bounds.north, bounds.west],
    [bounds.south, bounds.east]
  ])
}

/**
 * NB: We do not currently support crossing the antimeridian.
 */
export function fromLatLngBounds(bounds: L.LatLngBounds): ExtendedBounds {
  // Don't change the original bounds object
  let b = new L.LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast())

  if (b.getWest() < -180) {
    b = new L.LatLngBounds(new L.LatLng(b.getSouth(), -180), b.getNorthEast())
    window.alert(message('antimeridian', ANTIMERIDIAN_WARNING))
  }

  if (b.getEast() > 180) {
    b = new L.LatLngBounds(new L.LatLng(b.getSouth(), 180), b.getNorthEast())
    window.alert(message('antimeridian', ANTIMERIDIAN_WARNING))
  }

  const bboxString = b.toBBoxString()
  return {
    north: b.getNorth(),
    south: b.getSouth(),
    east: b.getEast(),
    west: b.getWest(),
    toString: () => bboxString
  }
}

/**
 * Reproject bounds to the grid size that we use.
 */
export function reprojectBounds(bounds: L.LatLngBounds): L.LatLngBounds {
  return new L.LatLngBounds(
    lonlat.toLeaflet(reprojectCoordinates(bounds.getSouthWest())),
    lonlat.toLeaflet(reprojectCoordinates(bounds.getNorthEast()))
  )
}
