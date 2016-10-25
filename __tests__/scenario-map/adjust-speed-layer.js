/* global describe, it, expect */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockSegment } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import AddTripPatternLayer from '../../lib/scenario-map/add-trip-pattern-layer'

describe('Scenario-Map > AddTripPatternLayer', () => {
  it('renders correctly', () => {
    const props = {
      segments: [mockSegment]
    }

    // mount component
    mount(
      <Map>
        <AddTripPatternLayer
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()

    // expect circleMarker to be added to map by intercepting call to Leaflet
    expect(Leaflet.circleMarker.mock.calls[0][0]).toMatchSnapshot()
  })
})
