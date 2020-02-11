import {testComponent} from 'lib/utils/component'
import {mockProject} from 'lib/utils/mock-data'

import ModificationsList from '../list'

test('Modification > List', () => {
  const c = testComponent(ModificationsList, {
    project: mockProject,
    setMapChildren: jest.fn()
  })
  expect(c.mount()).toMatchSnapshot()
})
