/* global describe, expect, it, jest */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockFeed, mockModification } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import StopLayer from '../../lib/scenario-map/stop-layer'

describe('Scenario-Map > StopLayer', () => {
  it('renders correctly', () => {
    const props = {
      feed: mockFeed,
      modification: mockModification,
      nullIsWildcard: true,
      onSelect: jest.fn(),
      selectedColor: 'blue',
      unselectedColor: 'red'
    }

    // mount component
    mount(
      <Map>
        <StopLayer
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )

    // expect circleMarkers to be added to map by intercepting call to Leaflet
    expect(Leaflet.circleMarker.mock.calls[0][0]).toMatchSnapshot()
    expect(Leaflet.circleMarker.mock.calls[1][0]).toMatchSnapshot()
  })
})
