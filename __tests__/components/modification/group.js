/* global jest */

import { basicRenderTest } from '../../../testUtils/unitUtils'

jest.mock('../../../lib/components/icon', () => 'Icon')
jest.mock('../../../lib/components/modification/title', () => 'ModificationTitle')

import ModificationGroup from '../../../lib/components/modification/group'

const activeModification = {
  id: '1234',
  name: 'Test Modification',
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
  bidirectional: false,
  showOnMap: false
}

basicRenderTest({
  component: ModificationGroup,
  name: 'Modification > ModificationGroup',
  notToBeCalledFns: ['replaceModification'],
  props: {
    activeModification: activeModification,
    modifications: [activeModification],
    projectId: '1234',
    replaceModification: jest.fn(),
    scenarioId: '1234',
    type: 'test'
  }
})
