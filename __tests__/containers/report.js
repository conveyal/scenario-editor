/* global describe, expect, it */

import { mount } from 'enzyme'
import nock from 'nock'
import React from 'react'
import { Provider } from 'react-redux'

import '../test-utils/mock-leaflet'
import {makeMockStore, mockProject, mockScenario, mockStores} from '../test-utils/mock-data.js'

import Report from '../../lib/containers/report'

describe('Container > Report', () => {
  it('renders correctly', () => {
    mockStores.init.scenario.variants.push('Mock Variant')
    const mockStore = makeMockStore(mockStores.init)

    // ensure that /api/project is called during first load
    nock('http://mockHost.com/')
      .get('/api/project/1')
      .reply(200, mockProject)
      .get('/api/scenario/1')
      .reply(200, mockScenario)
      .get('/api/scenario/1/modifications')
      .reply(200)

    const props = {
      // react-router params
      params: {
        projectId: '1',
        scenarioId: '1',
        variantId: '0'
      }
    }

    // mount component
    const tree = mount(
      <Provider store={mockStore}>
        <Report
          {...props}
          />
      </Provider>
      , {
        attachTo: document.getElementById('test')
      }
    )
    // when trying to make a snapshot from mountToJson, I got an out of memory error

    // assert that application was rendered
    expect(tree.find(Report).length).toBe(1)

    // ensure that actions were dispatched to load project
    expect(mockStore.getActions().length).toBeGreaterThan(0)
  })
})
