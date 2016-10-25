/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'
import { Provider } from 'react-redux'

import {makeMockStore} from '../../test-utils/mock-data.js'

import ModificationsList from '../../../lib/components/modification/list'

const mockStore = makeMockStore({
  project: {
    currentProject: {
      id: '1'
    }
  },
  scenario: {
    currentScenario: {
      id: '1',
      name: 'Test Scenario'
    },
    modifications: [],
    variants: []
  }
})

describe('Component > Modification > ModificationsList', () => {
  it('renders correctly', () => {
    const props = {
      activeModification: {},
      bundleId: '1',
      createModification: jest.fn(),
      defaultFeedId: '1',
      modificationsByType: {},
      projectId: '1',
      replaceModification: jest.fn(),
      scenarioId: '1',
      variants: []
    }
    const tree = mount(
      <Provider store={mockStore}>
        <ModificationsList
          {...props}
          />
      </Provider>
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    const noCalls = [
      'createModification',
      'replaceModification'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
