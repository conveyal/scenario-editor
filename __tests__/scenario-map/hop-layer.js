/* global describe, it, expect */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockFeed, mockModification } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import HopLayer from '../../lib/scenario-map/hop-layer'

mockModification.hops = []

describe('Scenario-Map > HopLayer', () => {
  it('renders correctly', () => {
    const props = {
      color: 'blue',
      feed: mockFeed,
      modification: mockModification
    }

    // mount component
    mount(
      <Map>
        <HopLayer
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})
