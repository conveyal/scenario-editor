/* global jest */

import { basicRenderTest, mockExports } from '../../../testUtils/unitUtils'

jest.mock('../../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../../lib/components/icon', () => 'Icon')
jest.mock('../../../lib/components/input', () => { return mockExports(['Checkbox', 'Number']) })
jest.mock('../../../lib/components/timetable', () => 'Timetable')

import AddTripPattern from '../../../lib/components/modification/add-trip-pattern'

const mapState = {
  allowExtend: true,
  extendFromEnd: true,
  followRoad: true,
  state: 'add-trip-pattern',
  modificationId: '1234'
}
const modification = {
  id: '1234',
  segments: [],
  timetables: [
    {
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
  ],
  bidirectional: false
}

basicRenderTest({
  component: AddTripPattern,
  name: 'Modification > AddTripPattern',
  notToBeCalledFns: ['replaceModification', 'setMapState', 'update'],
  props: {
    mapState: mapState,
    modification: modification,
    replaceModification: jest.fn(),
    setMapState: jest.fn(),
    update: jest.fn()
  }
})
