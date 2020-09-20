import flatMap from 'lodash/flatMap'
import {createSelector} from 'reselect'

import activeModification from './active-modification'
import modificationRoute from './modification-route'

interface Trip {
  trip_id: string
}

interface Pattern {
  trips: Trip[]
}

interface Route {
  patterns: Pattern[]
}

const selectPatternTripIds = createSelector(activeModification, (m) =>
  flatMap(m.entries || [], 'patternTrips')
)

export default createSelector(
  modificationRoute,
  selectPatternTripIds,
  (route: Route, tripIds: string[]) => {
    if (!route || tripIds.length === 0) return []

    const patternsWithTrips = []
    for (const pattern of route.patterns) {
      for (const trip of pattern.trips) {
        if (tripIds.indexOf(trip.trip_id) > -1) {
          patternsWithTrips.push(pattern)
          break
        }
      }
    }

    return patternsWithTrips
  }
)
