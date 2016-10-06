/* global jest */

import { mockComponents } from '../../testUtils'
import { basicRenderTest } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'ReactSelect')
jest.mock('../../lib/components/buttons', () => { return mockComponents(['Button']) })
jest.mock('../../lib/components/input', () => { return mockComponents(['Group']) })
jest.mock('../../lib/components/panel', () => { return mockComponents(['Body']) })

import SelectProject from '../../lib/components/select-project'

const createFn = jest.fn()
const mockProjects = [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }]
const pushFn = jest.fn()

basicRenderTest({
  component: SelectProject,
  name: 'SelectProject',
  notToBeCalledFns: [createFn, pushFn],
  props: {
    create: createFn,
    projects: mockProjects,
    push: pushFn
  }
})
