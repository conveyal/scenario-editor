/* global describe, it */

import { mount } from 'enzyme'
import React from 'react'

import Leaflet from '../test-utils/mock-leaflet'

import MiniMap from '../../lib/report/mini-map'

describe('Report > MiniMap', () => {
  it('renders correctly', () => {
    const props = {
      bounds: Leaflet.latLngBounds(
        [
          [40.712, -74.227],
          [40.774, -74.125]
        ]
      )
    }

    // mount component
    mount(
      <MiniMap
        {...props}
        />
      , {
        attachTo: document.getElementById('test')
      }
    )
  })
})
