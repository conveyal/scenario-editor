// @flow
import React from 'react'
import {Map} from 'react-leaflet'

import TransitEditor from '../'
import {
  mockFeed,
  mockModification,
  mockSegment,
  mockGtfsStops,
  mockWithProvider
} from '../../../../utils/mock-data.js'

mockFeed.stops = mockGtfsStops
mockModification.segments = [mockSegment]

describe('Component > Transit-Editor > TransitEditor', () => {
  it('renders correctly', () => {
    const props = {
      allowExtend: true,
      extendFromEnd: true,
      feeds: [mockFeed],
      followRoad: true,
      modification: mockModification,
      spacing: 0,
      updateModification: jest.fn()
    }

    // mount component
    const tree = mockWithProvider(
      <Map>
        <TransitEditor {...props} />
      </Map>
    )
    expect(props.updateModification).not.toBeCalled()
    // expect marker to be added to map by intercepting call to Leaflet
    expect(tree.snapshot()).toMatchSnapshot()
  })
})
