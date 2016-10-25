/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import Leaflet from '../../test-utils/mock-leaflet'
import { mockFeed, mockModification, mockSegment, mockStops } from '../../test-utils/mock-data.js'

import TransitEditor from '../../../lib/scenario-map/transit-editor/'

mockFeed.stops = mockStops
mockModification.segments = [mockSegment]

describe('Component > Transit-Editor > TransitEditor', () => {
  it('renders correctly', () => {
    const props = {
      allowExtend: true,
      extendFromEnd: true,
      feeds: [mockFeed],
      followRoad: true,
      modification: mockModification,
      replaceModification: jest.fn()
    }

    // mount component
    mount(
      <Map>
        <TransitEditor
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )

    expect(props['replaceModification']).not.toBeCalled()

    // expect marker to be added to map by intercepting call to Leaflet
    expect(Leaflet.marker.mock.calls[0][0]).toMatchSnapshot()
  })
})
