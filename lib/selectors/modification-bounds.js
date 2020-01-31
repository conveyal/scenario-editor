import get from 'lodash/get'
import lonlat from '@conveyal/lonlat'
import {createSelector} from 'reselect'

// Can import Leaflet here as this is only used directly on the map
import Leaflet from 'lib/leaflet'

import selectActiveModification from './active-modification'
import selectRoutePatterns from './route-patterns'

export default createSelector(
  selectActiveModification,
  selectRoutePatterns,
  (m, patterns) => {
    const geometries = [
      ...get(m, 'segments', [])
        .map(s => s.geometry)
        .filter(g => g.type !== 'Point'),
      ...(patterns || []).map(p => p.geometry)
    ]
    const coords = geometries.reduce(
      (c, g) => c.concat(g.coordinates.map(lonlat.toLeaflet)),
      []
    )
    if (coords.length > 1) {
      return Leaflet.latLngBounds(coords)
    }
  }
)
