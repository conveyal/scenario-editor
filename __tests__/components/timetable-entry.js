/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('../../lib/components/input', () => { return mockExports(['Checkbox', 'Number', 'Text']) })

import TimetableEntry from '../../lib/components/timetable-entry'

const timetable = {
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
  component: TimetableEntry,
  name: 'TimetableEntry',
  notToBeCalledFns: ['replaceTimetable'],
  props: {
    timetable: timetable,
    replaceTimetable: jest.fn()
  }
})
