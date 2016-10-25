/* global describe, it */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import '../test-utils/mock-leaflet'

import DirectionalMarkers from '../../lib/components/directional-markers'

describe('Component > DirectionalMarkers', () => {
  it('renders correctly', () => {
    mount(
      <Map>
        <DirectionalMarkers />
      </Map>
    , {
      attachTo: document.getElementById('test')
    })
  })
})
