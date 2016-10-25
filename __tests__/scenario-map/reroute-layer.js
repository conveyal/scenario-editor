/* global describe, it, expect */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockFeed, mockModification } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import RerouteLayer from '../../lib/scenario-map/reroute-layer'

describe('Scenario-Map > RerouteLayer', () => {
  it('renders correctly', () => {
    const props = {
      color: 'blue',
      dim: true,
      feed: mockFeed,
      modification: mockModification,
      showAddedSegment: true
    }

    // mount component
    mount(
      <Map>
        <RerouteLayer
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
