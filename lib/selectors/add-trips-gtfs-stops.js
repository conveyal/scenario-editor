// @flow
import {createSelector} from 'reselect'

import {ADD_TRIP_PATTERN} from '../constants'

import selectActiveModification from './active-modification'

export default createSelector(
  [selectActiveModification, state => state],
  (modification, state) => {
    return modification && modification.type === ADD_TRIP_PATTERN
      ? segmentStops(modification.segments, state.project.feeds)
      : []
  }
)

function segmentStops (segments, feeds = []) {
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
    .map(([feedId, stopId]) => {
      const feed = feeds.find(f => f.id === feedId)
      return feed ? {...feed.stopsById[stopId], stop_id: `${feedId}:${stopId}`}
        : {stop_id: `${feedId}:${stopId}`, stop_name: stopId}
    })
}
