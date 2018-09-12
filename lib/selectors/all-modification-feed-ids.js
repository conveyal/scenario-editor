// @flow
import {createSelector} from 'reselect'

import {ADD_TRIP_PATTERN, CONVERT_TO_FREQUENCY} from '../constants'

import selectModifications from './modifications'

export default createSelector(
  selectModifications,
  (modifications) => {
    const feedIds = []

    modifications.forEach((m) => {
      if (m.type === ADD_TRIP_PATTERN) {
        feedIds.push(...getFeedIdsFromPhaseStops(m.timetables))
      } else {
        feedIds.push(m.feed)

        if (m.type === CONVERT_TO_FREQUENCY) {
          feedIds.push(...getFeedIdsFromPhaseStops(m.entries))
        }
      }
    })

    return [...new Set(feedIds.filter(f => f))] // filter out null/undefined values
  }
)

function getFeedIdsFromPhaseStops (timetables = []) {
  return timetables
    .filter(tt => tt.phaseAtStop && tt.phaseAtStop.length > 0)
    .map(tt => [
      tt.phaseAtStop.split(':')[0],
      tt.phaseFromStop.split(':')[0]
    ])
    .reduce((acc, tt) => [...acc, ...tt], [])
}
