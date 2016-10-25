/* global describe, it, jest */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockFeed, mockModification } from '../test-utils/mock-data'
import { drawMock } from '../test-utils/mock-leaflet'

import HopSelectPolygon from '../../lib/scenario-map/hop-select-polygon'

drawMock()

mockModification.hops = []

describe('Scenario-Map > HopSelectPolygon', () => {
  it('renders correctly', () => {
    const props = {
      action: 'new',
      feed: mockFeed,
      modification: mockModification,
      replaceModification: jest.fn(),
      setMapState: jest.fn()
    }

    // mount component
    mount(
      <Map>
        <HopSelectPolygon
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )
  })
})
