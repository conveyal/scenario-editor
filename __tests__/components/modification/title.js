/* global jest */

import { basicRenderTest } from '../../../testUtils/unitUtils'

import Title from '../../../lib/components/modification/title'

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
  component: Title,
  name: 'Modification > Title',
  notToBeCalledFns: ['replaceModification'],
  props: {
    active: true,
    modification: modification,
    name: 'Title',
    projectId: '1234',
    replaceModification: jest.fn(),
    scenarioId: '1234',
    showOnMap: true
  }
})
