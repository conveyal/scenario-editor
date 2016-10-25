/* global describe, expect, it */

import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'

import '../test-utils/mock-leaflet'
import {makeMockStore, mockStores} from '../test-utils/mock-data.js'

import ScenarioMap from '../../lib/scenario-map/index'

const mockStore = makeMockStore(mockStores.init)

describe('Component > ScenarioMap', () => {
  it('renders correctly', () => {
    // mount component
    const tree = mount(
      <Provider store={mockStore}>
        <ScenarioMap />
      </Provider>
      , {
        attachTo: document.getElementById('test')
      }
    )

    expect(tree.find(ScenarioMap).length).toBe(1)
  })
})
