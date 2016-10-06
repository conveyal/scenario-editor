/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../lib/components/icon', () => 'Icon')
jest.mock('../../lib/components/input', () => { return mockExports(['Text']) })
jest.mock('../../lib/components/select-patterns', () => 'SelectPatterns')
jest.mock('../../lib/components/select-trip', () => 'SelectTrip')
jest.mock('../../lib/components/timetable-entry', () => 'TimetableEntry')

import FrequencyEntry from '../../lib/components/frequency-entry'

const timetable = {
  name: 'mock timetable',
  patternTrips: 'mockPatternTrips',
  sourceTrip: 'mockSourceTrip'
}

basicRenderTest({
  component: FrequencyEntry,
  name: 'FrequencyEntry',
  notToBeCalledFns: ['replaceTimetable', 'removeTimetable', 'setActiveTrips'],
  props: {
    feed: {},
    replaceTimetable: jest.fn(),
    removeTimetable: jest.fn(),
    setActiveTrips: jest.fn(),
    timetable: timetable,
    routes: [],
    trip: 'mockTrip'
  }
})
