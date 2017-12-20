// @flow

import React from 'react'
import {Map} from 'react-leaflet'
import renderer from 'react-test-renderer'

import Isochrone from '../isochrone'

describe('Components > Map > Isochrone', () => {
  it('renders correctly', () => {
    const props = {
      comparisonInProgress: false,
      comparisonIsochrone: null,
      isDestinationTravelTimeDistributionComponentOnMap: false,
      isFetchingIsochrone: false,
      isochrone: null,
      isochroneCutoff: 10,
      isochroneLonLat: { lat: 38.898, lon: -77.015 },
      isochroneIsStale: false,
      variantIndex: 1,

      // actions
      addDestinationTravelTimeDistributionComponentToMap: jest.fn(),
      fetchTravelTimeSurface: jest.fn(),
      remove: jest.fn(),
      removeDestinationTravelTimeDistributionComponentFromMap: jest.fn(),
      setDestination: jest.fn(),
      setIsochroneLonLat: jest.fn()
    }

    const tree = renderer.create(
      <Map>
        <Isochrone {...props} />
      </Map>
    )
    expect(tree).toMatchSnapshot()

    // expect isochrone marker to be added to map by intercepting call to Leaflet
    // expect(Leaflet.marker.mock.calls[0][0]).toMatchSnapshot()
  })
})
