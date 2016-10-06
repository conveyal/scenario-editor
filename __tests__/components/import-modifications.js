/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'React-Select')
jest.mock('../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../lib/components/panel', () => { return mockExports(['Panel', 'Heading', 'Body']) })

import ImportModifications from '../../lib/components/import-modifications'

basicRenderTest({
  component: ImportModifications,
  name: 'ImportModifications',
  notToBeCalledFns: ['copyFromScenario'],
  props: {
    copyFromScenario: jest.fn(),
    toScenarioId: '1',
    variants: []
  }
})
