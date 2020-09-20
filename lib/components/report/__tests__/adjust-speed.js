//
import enzyme from 'enzyme'
import React from 'react'

import AdjustSpeed from '../adjust-speed'
import {mockFeed, mockModification} from '../../../utils/mock-data'

describe('Report > AdjustSpeed', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: {1: mockFeed},
      modification: {...mockModification, scale: 4}
    }

    // mount component
    const tree = enzyme.shallow(<AdjustSpeed {...props} />)
    expect(tree).toMatchSnapshot()
  })
})
