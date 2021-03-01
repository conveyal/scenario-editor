//
import enzyme from 'enzyme'
import React from 'react'

import RemoveTrips from '../remove-trips'
import {mockFeed, mockModification} from '../../../utils/mock-data'

describe('Report > RemoveTrips', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: {1: mockFeed},
      modification: mockModification
    }

    // mount component
    enzyme.mount(<RemoveTrips {...props} />)
  })
})
