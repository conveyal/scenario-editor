/* global describe, it, expect */

import {getExactTimesFirstDepartures} from '../timetable'
import {hhMmStringToSeconds} from '../time'

describe('Utilities > Timetable', () => {
  it('should generate firstDepartures array correctly', () => {
    expect(getExactTimesFirstDepartures({
      startTime: hhMmStringToSeconds('7:00'),
      endTime: hhMmStringToSeconds('9:00'),
      headwaySecs: hhMmStringToSeconds('0:15')
    })).toEqual([
      '7:00',
      '7:15',
      '7:30',
      '7:45',
      '8:00',
      '8:15',
      '8:30',
      '8:45'
      // no 9:00, range is inclusive on left and exclusive on right to match GTFS, per
      // https://groups.google.com/forum/#!topic/gtfs-changes/5u8yXBrpK2w
    ].map(hhMmStringToSeconds))
  })
})
