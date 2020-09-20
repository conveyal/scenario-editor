//
import enzyme from 'enzyme'
import React from 'react'

import RemoveStops from '../remove-stops'
import {mockFeed, mockModification, mockPattern} from '../../../utils/mock-data'

describe('Component > Modification > RemoveStops', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      modification: mockModification,
      routePatterns: [mockPattern],
      routeStops: [],
      selectedFeed: mockFeed,
      selectedStops: [],
      update: jest.fn(),
      updateAndRetrieveFeedData: jest.fn()
    }
    const tree = enzyme.shallow(<RemoveStops {...props} />)
    expect(tree).toMatchSnapshot()
    const noCalls = ['update']
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toHaveBeenCalled()
    })
    tree.unmount()
  })
})
