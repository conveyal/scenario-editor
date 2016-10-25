/* global describe, it, expect */

import { mount } from 'enzyme'
import Leaflet from '../../test-utils/mock-leaflet'
import React from 'react'
import { Map } from 'react-leaflet'

import GeoJSON from '../../../lib/components/map/geojson'

describe('Components > Map > GeoJSON', () => {
  it('renders correctly', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: []
    }

    mount(
      <Map>
        <GeoJSON
          data={geojson}
          />
      </Map>
    , {
      attachTo: document.getElementById('test')
    })

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})
