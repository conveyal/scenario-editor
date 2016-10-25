/* global describe, expect, it, jest */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockStops, mockModification } from '../test-utils/mock-data'
import { drawMock } from '../test-utils/mock-leaflet'

import StopSelectSingle from '../../lib/scenario-map/stop-select-single'

drawMock()

describe('Scenario-Map > StopSelectSingle', () => {
  it('renders correctly', () => {
    const props = {
      action: 'new',
      modification: mockModification,
      replaceModification: jest.fn(),
      routeStops: mockStops,
      setMapState: jest.fn()
    }

    // mount component
    mount(
      <Map>
        <StopSelectSingle
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )

    const noCalls = [
      'replaceModification',
      'setMapState'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
