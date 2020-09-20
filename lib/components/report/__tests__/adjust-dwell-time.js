//
import enzyme from 'enzyme'
import React from 'react'

import AdjustDwellTime from '../adjust-dwell-time'
import {mockFeed, mockModification} from '../../../utils/mock-data'

describe('Report > AdjustDwellTime', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: {1: mockFeed},
      modification: {...mockModification, value: 4}
    }

    // mount component
    const tree = enzyme.shallow(<AdjustDwellTime {...props} />)
    expect(tree).toMatchSnapshot()
  })
})
