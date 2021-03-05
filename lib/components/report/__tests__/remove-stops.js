//
import enzyme from 'enzyme'
import React from 'react'

import RemoveStops from '../remove-stops'
import {mockFeed, mockModification} from '../../../utils/mock-data'

describe('Report > RemoveStops', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: {1: mockFeed},
      modification: mockModification
    }

    enzyme.mount(<RemoveStops {...props} />)
  })
})
