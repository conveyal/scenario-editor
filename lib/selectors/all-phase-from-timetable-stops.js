import {createSelector} from 'reselect'

import selectActiveModification from './active-modification'
import selectFeedsById from './feeds-by-id'
import selectModifications from './modifications'
import {getStopFromFeed, patternTripsInModification} from './route-stops'

/**
 * Get the timetables for the active modification.
 */
const selectTimetables = createSelector(
  selectActiveModification,
  (modification = {}) =>
    (modification.entries && modification.entries.length > 0) ||
    (modification.timetables && modification.timetables.length > 0)
      ? (modification.entries || modification.timetables)
          .filter(tt => !!tt.phaseFromTimetable)
          .map(tt => tt.phaseFromTimetable)
      : []
)

/**
 * Get the modifications in a map of `phaseFromTimetable` -> Modification
 */
const selectPhaseModifications = createSelector(
  [selectTimetables, selectModifications],
  (phaseFromTimetables, modifications) =>
    phaseFromTimetables && phaseFromTimetables.length > 0
      ? phaseFromTimetables.reduce((_, pft) => {
          _[pft] = modifications.find(m => m._id === pft.split(':')[0])
          return _
        }, {})
      : {}
)

export default createSelector(
  [selectPhaseModifications, selectFeedsById],
  (modifications, feedsById) => {
    const stopsForTimetable = {}
    Object.keys(modifications).forEach(key => {
      const modification = modifications[key]
      if (!modification) return
      if (modification.entries) {
        // get stops from a referenced adjust-frequency mod (which has entries)
        const entry = modification.entries.find(
          e => e._id === key.split(':')[1]
        )
        if (!entry) return
        const feedId = modification.feed
        const feed = feedsById[feedId]
        if (!feed) return
        const modificationPatterns = feed.routes.find(
          r => r.route_id === modification.routes[0]
        ).patterns
        // Get stops of a trip in a referenced modification
        // (not the active modification, which is why we don't use a selector)
        const sourceTrip = modificationPatterns.find(
          patternTripsInModification([entry.sourceTrip])
        )
        if (!sourceTrip) return
        stopsForTimetable[key] = sourceTrip.stops
          .map(s => s.stop_id)
          .map(getStopFromFeed(feed.stopsById))
          .map(s => ({...s, stop_id: `${feedId}:${s.stop_id}`}))
      } else {
        // get stops from a referenced add-trip-pattern mod (which has timetables)
        stopsForTimetable[key] = segmentStops(modification.segments, feedsById)
      }
    })
    return stopsForTimetable
  }
)

function segmentStops(segments, feedsById = {}) {
  const feedStopIds = [
    ...new Set(
      segments.reduce(
        (stops, segment) => [...stops, segment.fromStopId, segment.toStopId],
        []
      )
    )
  ]
  return feedStopIds
    .filter(fsi => !!fsi)
    .map(fsi => fsi.split(':'))
    .map(([feedId, stopId]) =>
      feedsById[feedId]
        ? {
            ...feedsById[feedId].stopsById[stopId],
            stop_id: `${feedId}:${stopId}`
          }
        : {stop_id: `${feedId}:${stopId}`}
    )
}
