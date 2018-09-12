// @flow

import React from 'react'
import {Map} from 'react-leaflet'
import renderer from 'react-test-renderer'

import RerouteLayer from '../reroute-layer'
import {mockFeed, mockModification, mockStop1} from '../../../utils/mock-data'

describe('Project-Map > RerouteLayer', () => {
  it('renders correctly', () => {
    // mount component
    const tree = renderer.create(
      <Map>
        <RerouteLayer
          addedColor='red'
          color='blue'
          dim
          feed={mockFeed}
          highlightSegment={0}
          highlightStop={mockStop1}
          modification={mockModification}
          showAddedSegment
        />
      </Map>
    )
    expect(tree).toMatchSnapshot()

    // expect geojson to be added to map by intercepting call to Leaflet
    // expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})
