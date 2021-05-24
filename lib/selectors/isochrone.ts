import lonlat from '@conveyal/lonlat'
import {createSelector} from 'reselect'

import jsolines from 'lib/utils/jsolines'

import selectMaxTripDurationMinutes from './max-trip-duration-minutes'

/**
 * SingleValuedSurface, width, height all come from selector defined below and
 * thus must be passed in one argument.
 */
export function computeIsochrones(
  accessGrid: CL.AccessGrid,
  cutoff: number
): GeoJSON.FeatureCollection<GeoJSON.MultiPolygon> {
  const featureCollection: GeoJSON.FeatureCollection<GeoJSON.MultiPolygon> = {
    type: 'FeatureCollection',
    features: []
  }
  if (accessGrid == null) return featureCollection
  for (let depth = 0; depth < accessGrid.depth; depth++) {
    featureCollection.features.push(
      jsolines({
        surface: accessGrid.data[depth],
        width: accessGrid.width,
        height: accessGrid.height,
        cutoff,
        project: ([x, y]) => {
          const ll = lonlat.fromPixel(
            {
              x: x + accessGrid.west,
              y: y + accessGrid.north
            },
            accessGrid.zoom
          )
          return [ll.lon, ll.lat]
        }
      })
    )
  }

  return featureCollection
}

export default createSelector(
  (state) => state.analysis.travelTimeSurface,
  selectMaxTripDurationMinutes,
  computeIsochrones
)
