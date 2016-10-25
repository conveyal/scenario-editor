/* global describe, expect, it */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import Leaflet from '../../test-utils/mock-leaflet'

import GeoJsonMousedown from '../../../lib/scenario-map/transit-editor/geojson-mousedown'

describe('Scenario-Map > Transit-Editor > GeoJsonMousedown', () => {
  it('renders correctly', () => {
    const props = {
      data: {
        type: 'FeatureCollection',
        features: []
      }
    }

    // mount component
    mount(
      <Map>
        <GeoJsonMousedown
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
