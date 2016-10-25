/* global describe, expect, it */

import { mount } from 'enzyme'
import nock from 'nock'
import React from 'react'
import { Provider } from 'react-redux'

import '../test-utils/mock-leaflet'
import {makeMockStore, mockStores} from '../test-utils/mock-data.js'

import Application from '../../lib/containers/application'

describe('Container > Application', () => {
  it('renders correctly', () => {
    const mockStore = makeMockStore(mockStores.init)

    // ensure that /api/project is called during first load
    nock('http://mockHost.com/')
      .get('/api/project')
      .reply(200, {})

    const props = {
      // react-router params
      params: {}
    }

    // mount component
    const tree = mount(
      <Provider store={mockStore}>
        <Application
          {...props}
          />
      </Provider>
      , {
        attachTo: document.getElementById('test')
      }
    )
    // when trying to make a snapshot from mountToJson, I got an out of memory error

    // assert that application was rendered
    expect(tree.find(Application).length).toBe(1)

    // ensure that actions were dispatched to load project
    expect(mockStore.getActions().length).toBeGreaterThan(0)
  })
})
