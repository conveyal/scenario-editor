//
import enzyme from 'enzyme'
import React from 'react'

import AdjustFrequency from '../adjust-frequency'
import {mockFeed, mockModification} from '../../../utils/mock-data'

describe('Report > AdjustFrequency', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: {1: mockFeed},
      modification: mockModification
    }

    // mount component
    const tree = enzyme.shallow(<AdjustFrequency {...props} />)
    expect(tree).toMatchSnapshot()
  })
})
