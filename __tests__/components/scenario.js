/* global jest */

import { basicRenderTest } from '../../testUtils/unitUtils'

jest.mock('../../lib/components/icon', () => 'Icon')

import Scenario from '../../lib/components/scenario'

basicRenderTest({
  children: 'Scenario content',
  component: Scenario,
  name: 'Scenario',
  notToBeCalledFns: ['addComponentToMap'],
  props: {
    addComponentToMap: jest.fn(),
    id: '1234',
    isLoaded: false,
    load: jest.fn(),
    name: 'Test',
    projectId: 'Test1234'
  },
  toBeCalledFns: ['load']
})
