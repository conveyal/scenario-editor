import {createSelector} from 'reselect'

import selectActiveModification from './active-modification'
import selectModifications from './modifications'
import routeStops from './route-stops'

/**
 * Get the timetables for the active modification.
 */
const selectTimetables = createSelector(
  selectActiveModification,
  (modification = {}) =>
    ((modification.entries && modification.entries.length > 0) ||
      (modification.timetables && modification.timetables.length > 0)
      ? (modification.entries || modification.timetables)
        .filter(tt => !!tt.phaseFromTimetable)
        .map(tt => tt.phaseFromTimetable)
      : [])
)

/**
 * Get the modifications in a map of `phaseFromTimetable` -> Modification
 */
const selectPhaseModifications = createSelector(
  [selectTimetables, selectModifications],
  (phaseFromTimetables, modifications) =>
    (phaseFromTimetables && phaseFromTimetables.length > 0
      ? phaseFromTimetables.reduce((_, pft) => {
        _[pft] = modifications.find((m) => m._id === pft.split(':')[0])
        return _
      }, {})
      : {})
)

export default createSelector(
  [selectPhaseModifications, state => state],
  (modifications, state) => {
    const stopsForTimetable = {}
    Object.keys(modifications).forEach(key => {
      const modification = modifications[key]
      if (!modification) return
      if (modification.entries) {
        const entry = modification.entries.find(e => e._id === key.split(':')[1])
        stopsForTimetable[key] = routeStops(state, {
          modification: {
            ...modification,
            trips: entry.patternTrips
          }
        }).map(stop => ({
          ...stop,
          stop_id: `${modification.feed}:${stop.stop_id}`
        }))
      } else {
        stopsForTimetable[key] = segmentStops(
          modification.segments,
          state.project.feedsById
        )
      }
    })
    return stopsForTimetable
  }
)

function segmentStops (segments, feedsById = {}) {
  const feedStopIds = [
    ...new Set(
      segments.reduce(
        (stops, segment) => [...stops, segment.fromStopId, segment.toStopId],
        []
      )
    )
  ]
  return feedStopIds.filter(fsi => !!fsi).map(fsi => fsi.split(':')).map(
    ([feedId, stopId]) =>
      (feedsById[feedId]
        ? {
          ...feedsById[feedId].stopsById[stopId],
          stop_id: `${feedId}:${stopId}`
        }
        : {stop_id: `${feedId}:${stopId}`})
  )
}
