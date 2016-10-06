/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'React-Select')
jest.mock('../../lib/components/input', () => { return mockExports(['Group']) })

import SelectPatterns from '../../lib/components/select-patterns'

const routePatterns = [
  {
    pattern_id: 1,
    name: 'mock pattern',
    trips: []
  }
]

basicRenderTest({
  component: SelectPatterns,
  name: 'SelectPatterns',
  notToBeCalledFns: ['onChange'],
  props: {
    onChange: jest.fn(),
    routePatterns: routePatterns
  }
})
