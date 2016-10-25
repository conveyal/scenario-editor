/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import Leaflet from '../../test-utils/mock-leaflet'
import React from 'react'
import { Map } from 'react-leaflet'

import Isochrone from '../../../lib/components/map/isochrone'

describe('Components > Map > Isochrone', () => {
  it('renders correctly', () => {
    const props = {
      bundleId: 'bundle-id',
      fetchIsochrone: jest.fn(),
      isochroneLatLng: {
        lat: 38.898,
        lon: -77.015
      },
      modifications: [],
      remove: jest.fn(),
      scenarioId: 'scenario-id'
    }

    mount(
      <Map>
        <Isochrone
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      })

    // expect isochrone marker to be added to map by intercepting call to Leaflet
    expect(Leaflet.marker.mock.calls[0][0]).toMatchSnapshot()
  })
})
