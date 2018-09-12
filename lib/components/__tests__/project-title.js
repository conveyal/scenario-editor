// @flow
import React from 'react'
import renderer from 'react-test-renderer'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

import ProjectTitle from '../project-title'
import {mockProject} from '../../utils/mock-data'

describe('Component > ProjectTitle', () => {
  function createTestData () {
    const deleteProjectFn = jest.fn()
    const downloadScenarioFn = jest.fn()
    return {
      component: (
        <ProjectTitle
          _id={mockProject._id}
          children='Children content'
          downloadScenario={downloadScenarioFn}
          project={mockProject}
        />
      ),
      deleteProjectFn,
      downloadScenarioFn
    }
  }

  afterEach(() => {
    // jsdom persists across test cases, so we need to remove stuff so it doesn't
    // get found again
    const ulTags = document.getElementsByTagName('ul')
    Object.keys(ulTags).forEach(key => {
      ulTags.item(key).remove()
    })
  })

  it('renders correctly', () => {
    const testData = createTestData()
    const tree = renderer
      .create(testData.component)
      .toJSON()
    expect(tree).toMatchSnapshot()
    expect(testData.downloadScenarioFn).not.toBeCalled()
  })

  it('should show print select dialogue', () => {
    const testData = createTestData()
    const tree = mount(testData.component)

    tree.find('[name="Print a scenario from this project"]').simulate('click')

    // snapshot to make sure modal is created
    expect(mountToJson(tree)).toMatchSnapshot()

    // find contents of modal
    const ulTag = document.getElementsByTagName('ul')[0]
    expect(ulTag.outerHTML).toMatchSnapshot()
  })

  it('should show export select dialogue', () => {
    const testData = createTestData()
    const tree = mount(testData.component)

    tree.find('[name="Download a scenario from this project"]').simulate('click')

    // snapshot to make sure modal is created
    expect(mountToJson(tree)).toMatchSnapshot()

    // find contents of modal
    const ulTag = document.getElementsByTagName('ul')[0]
    expect(ulTag.outerHTML).toMatchSnapshot()
  })
})
