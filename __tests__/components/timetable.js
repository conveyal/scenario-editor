/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../lib/components/icon', () => 'Icon')
jest.mock('../../lib/components/input', () => { return mockExports(['Number', 'Text']) })
jest.mock('../../lib/components/timetable-entry', () => 'TimetableEntry')

import Timetable from '../../lib/components/timetable'

const timetable = {
  name: 'Test timetable',
  speed: 40,
  dwellTime: 10,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  headwaySecs: 900, // 15 minutes
  startTime: 28800, // 8am
  endTime: 57600 // 4pm
}

basicRenderTest({
  component: Timetable,
  name: 'Timetable',
  notToBeCalledFns: ['removeTimetable', 'replaceTimetable'],
  props: {
    timetable: timetable,
    removeTimetable: jest.fn(),
    replaceTimetable: jest.fn()
  }
})
