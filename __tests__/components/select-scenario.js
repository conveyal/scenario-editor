/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'React-Select')
jest.mock('../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../lib/components/input', () => { return mockExports(['Group']) })
jest.mock('../../lib/components/panel', () => { return mockExports(['Body']) })

import SelectScenario from '../../lib/components/select-scenario'

const mockScenarios = [{ id: 1, name: 'S1' }, { id: 2, name: 'S2' }]

basicRenderTest({
  component: SelectScenario,
  name: 'SelectScenario',
  notToBeCalledFns: ['push'],
  props: {
    projectId: 'P1',
    push: jest.fn(),
    scenarios: mockScenarios
  }
})
