import lonlat from '@conveyal/lonlat'

import Leaflet from 'lib/leaflet'
import message from 'lib/message'
import type L from 'leaflet'

import reprojectCoordinates from './reproject-coordinates'

const ANTIMERIDIAN_WARNING =
  'We do not currently support bounds that cross the antimeridian.'

type Bounds = {
  north: number
  south: number
  east: number
  west: number
  toString: () => string
}

export const directions = {
  north: {
    min: -90,
    max: 90,
    isValid: (n: number, b: Partial<Bounds>) => n > b.south
  },
  south: {
    min: -90,
    max: 90,
    isValid: (s: number, b: Partial<Bounds>) => s < b.north
  },
  west: {
    min: -180,
    max: 180,
    isValid: (w: number, b: Partial<Bounds>) => w < b.east
  },
  east: {
    min: -180,
    max: 180,
    isValid: (e: number, b: Partial<Bounds>) => e > b.west
  }
}

/**
 * Check if a given bound is valid
 */
export function boundIsValid(
  dir: string,
  val: number,
  otherBounds: Partial<Bounds>
): boolean {
  const {min, max, isValid} = directions[dir]
  return !isNaN(val) && val >= min && val <= max && isValid(val, otherBounds)
}

/**
 * Check if bounds are valid
 */
export function boundsAreValid(bounds: Partial<Bounds>): boolean {
  for (const dir of Object.keys(directions)) {
    if (!boundIsValid(dir, bounds[dir], bounds)) return false
  }
  return true
}

/**
 * Convert Bounds to Leaflet Bounds.
 */
export function toLatLngBounds(
  bounds: Bounds | L.LatLngBounds
): L.LatLngBounds {
  // Check if it's already a leaflet bounds object
  if (bounds instanceof Leaflet.LatLngBounds) return bounds
  return new Leaflet.LatLngBounds([
    [bounds.north, bounds.west],
    [bounds.south, bounds.east]
  ])
}

/**
 * NB: We do not currently support crossing the antimeridian.
 */
export function fromLatLngBounds(bounds: L.LatLngBounds) {
  // Don't change the original bounds object
  let b = new Leaflet.LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast())

  if (b.getWest() < -180) {
    b = new Leaflet.LatLngBounds(
      new Leaflet.LatLng(b.getSouth(), -180),
      b.getNorthEast()
    )
    window.alert(message('antimeridian', ANTIMERIDIAN_WARNING))
  }

  if (b.getEast() > 180) {
    b = new Leaflet.LatLngBounds(
      new Leaflet.LatLng(b.getSouth(), 180),
      b.getNorthEast()
    )
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
export function reprojectBounds(bounds) {
  return new Leaflet.LatLngBounds(
    lonlat.toLeaflet(reprojectCoordinates(bounds.getSouthWest())),
    lonlat.toLeaflet(reprojectCoordinates(bounds.getNorthEast()))
  )
}
