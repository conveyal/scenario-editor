import enzyme from 'enzyme'
import React from 'react'

import Reroute from '../reroute'
import {mockFeed, mockModification, mockSegment} from '../../../utils/mock-data'

mockModification.segments.push(mockSegment)

describe('Report > Reroute', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: {1: mockFeed},
      modification: {
        ...mockModification,
        segmentSpeeds: mockModification.segments.map(() => 10)
      }
    }

    enzyme.mount(<Reroute {...props} />)
  })
})
