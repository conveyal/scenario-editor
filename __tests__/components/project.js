/* global jest */

import { basicRenderTest } from '../../testUtils/unitUtils'

jest.mock('../../lib/components/icon', () => 'Icon')

import Project from '../../lib/components/project'

basicRenderTest({
  children: 'Project content',
  component: Project,
  name: 'Project',
  props: {
    description: 'A test project',
    id: '1234',
    load: jest.fn(),
    name: 'Test'
  },
  toBeCalledFns: ['load']
})
