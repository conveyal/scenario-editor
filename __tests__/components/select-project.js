/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'ReactSelect')
jest.mock('../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../lib/components/input', () => { return mockExports(['Group']) })
jest.mock('../../lib/components/panel', () => { return mockExports(['Body']) })

import SelectProject from '../../lib/components/select-project'

const mockProjects = [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }]

basicRenderTest({
  component: SelectProject,
  name: 'SelectProject',
  notToBeCalledFns: ['create', 'push'],
  props: {
    create: jest.fn(),
    projects: mockProjects,
    push: jest.fn()
  }
})
