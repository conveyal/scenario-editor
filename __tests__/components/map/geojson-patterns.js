/* global describe, it, expect */

import { mount } from 'enzyme'
import Leaflet from '../../test-utils/mock-leaflet'
import React from 'react'
import { Map } from 'react-leaflet'

import Patterns from '../../../lib/components/map/geojson-patterns'

describe('Components > Map > GeoJSON-Patterns', () => {
  it('renders correctly', () => {
    const props = {
      patterns: [],
      color: 'blue'
    }

    mount(
      <Map>
        <Patterns
          {...props}
          />
      </Map>
    , {
      attachTo: document.getElementById('test')
    })

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})
