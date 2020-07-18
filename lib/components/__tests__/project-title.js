import message from 'lib/message'
import {mockProject} from 'lib/utils/mock-data'
import {testComponent} from 'lib/utils/component'

import ProjectTitle from '../project-title'

test('Component > ProjectTitle', () => {
  const p = testComponent(ProjectTitle, {project: mockProject})
  const tree = p.mount()
  expect(tree).toMatchSnapshot()

  // Modal should not exist yet
  expect(tree.exists('ExportProject')).toBe(false)

  // Show export dialog
  tree
    .find(`button[aria-label="${message('project.export')}"]`)
    .simulate('click')

  // find contents of modal
  expect(tree.exists('ExportProject')).toBe(true)

  // Unmount without errors
  tree.unmount()
})
