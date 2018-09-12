// @flow

import renderer from 'react-test-renderer'
import React from 'react'

import {mockFeed, mockModification, mockPattern} from '../../../utils/mock-data'
import AdjustDwellTime from '../adjust-dwell-time'

describe('Component > Modification > AdjustDwellTime', () => {
  const props = {
    addControl: jest.fn(),
    addLayer: jest.fn(),
    feeds: [],
    modification: mockModification,
    removeControl: jest.fn(),
    removeLayer: jest.fn(),
    routePatterns: [],
    routeStops: [],
    selectedFeed: undefined,
    selectedStops: [],
    setMapState: jest.fn(),
    update: jest.fn(),
    updateAndRetrieveFeedData: jest.fn()
  }

  const noCalls = [
    'addControl',
    'addLayer',
    'removeControl',
    'removeLayer',
    'setMapState',
    'update'
  ]

  it('renders empty correctly', () => {
    const tree = renderer.create(<AdjustDwellTime {...props} />).toJSON()
    expect(tree).toMatchSnapshot()

    noCalls.forEach(fn => {
      expect(props[fn]).not.toBeCalled()
    })
  })

  it('renders with data correctly', () => {
    const tree = renderer
      .create(
        <AdjustDwellTime
          {...props}
          feed={[mockFeed]}
          routePatterns={[mockPattern]}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()

    noCalls.forEach(fn => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
