// @flow
import selectAllModificationFeedIds from '../all-modification-feed-ids'
import {ADD_TRIP_PATTERN, ADJUST_DWELL_TIME, CONVERT_TO_FREQUENCY} from '../../constants'

const {describe, expect, it} = global
describe('selectors > all-modification-feed-ids', () => {
  it('should select all the feed ids', () => {
    const allFeedIds = selectAllModificationFeedIds({
      project: {
        modifications: [{
          type: ADD_TRIP_PATTERN,
          timetables: [{
            phaseAtStop: 'feed1:stopid1',
            phaseFromStop: 'feed1:stopid2'
          }]
        }, {
          type: ADJUST_DWELL_TIME,
          feed: 'feed2'
        }, {
          type: CONVERT_TO_FREQUENCY,
          feed: 'feed2',
          entries: [{
            phaseAtStop: 'feed3:stopid3',
            phaseFromStop: 'feed3:stopid4'
          }]
        }]
      }
    })

    expect(allFeedIds).toHaveLength(3)
  })
})
