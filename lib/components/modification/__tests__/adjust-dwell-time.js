//
import enzyme from 'enzyme'
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
    update: jest.fn(),
    updateAndRetrieveFeedData: jest.fn()
  }

  const noCalls = [
    'addControl',
    'addLayer',
    'removeControl',
    'removeLayer',
    'update'
  ]

  it('renders empty correctly', () => {
    const tree = enzyme.shallow(<AdjustDwellTime {...props} />)
    expect(tree).toMatchSnapshot()

    noCalls.forEach((fn) => {
      expect(props[fn]).not.toHaveBeenCalled()
    })
    tree.unmount()
  })

  it('renders with data correctly', () => {
    const tree = enzyme.shallow(
      <AdjustDwellTime
        {...props}
        feed={[mockFeed]}
        routePatterns={[mockPattern]}
      />
    )
    expect(tree).toMatchSnapshot()

    noCalls.forEach((fn) => {
      expect(props[fn]).not.toHaveBeenCalled()
    })
    tree.unmount()
  })
})
