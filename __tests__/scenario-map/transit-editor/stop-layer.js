/* global describe, it */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import '../../test-utils/mock-leaflet'
import { mockStops } from '../../test-utils/mock-data.js'

import StopLayer from '../../../lib/scenario-map/transit-editor/stop-layer'

describe('Component > Transit-Editor > StopLayer', () => {
  it('renders correctly', () => {
    const props = {
      stops: mockStops
    }

    // mount component
    mount(
      <Map>
        <StopLayer
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )
  })
})
