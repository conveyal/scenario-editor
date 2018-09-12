// @flow
import Leaflet from 'leaflet'

// Turn a pattern into it's array of coordinates, lon first
const getPatternCoords = p => p.geometry.coordinates.map(ll => [ll[1], ll[0]])
const getRouteCoords = r => [].concat(...r.patterns.map(getPatternCoords))

/**
 * Get the Leaflet.LatLngBounds for a route.
 */
export function getRouteBounds (route) {
  return Leaflet.latLngBounds(getRouteCoords(route))
}
