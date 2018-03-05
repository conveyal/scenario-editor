// @flow
import React from 'react'
import {Map} from 'react-leaflet'

import AddTripPatternLayer from '../add-trip-pattern-layer'
import {mockWithProvider, mockSegment} from '../../../utils/mock-data'

describe('Project-Map > AddTripPatternLayer', () => {
  it('renders correctly', () => {
    // mount component
    expect(mockWithProvider(
      <Map>
        <AddTripPatternLayer segments={[mockSegment]} bidirectional={false} />
      </Map>
    ).snapshot()).toMatchSnapshot()
  })
})
