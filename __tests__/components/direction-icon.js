/* global describe, it, expect */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import Leaflet from '../test-utils/mock-leaflet'

import DirectionIcon from '../../lib/components/direction-icon'

describe('Component > DirectionIcon', () => {
  it('renders correctly', () => {
    mount(
      <Map>
        <DirectionIcon
          bearing={123}
          clickable
          color='blue'
          coordinates={[12, 34]}
          iconSize={20}
          />
      </Map>
    , {
      attachTo: document.getElementById('test')
    })

    // expect map marker icon to be added to map by intercepting call to Leaflet
    expect(Leaflet.marker.mock.calls[0][0]).toMatchSnapshot()
  })
})
