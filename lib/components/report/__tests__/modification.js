//
import enzyme from 'enzyme'
import React from 'react'

import Modification from '../modification'
import {mockFeed, mockModification} from '../../../utils/mock-data'

mockModification.type = 'adjust-dwell-time'

describe('Report > Modification', () => {
  it('renders correctly', () => {
    const props = {
      modification: {...mockModification, value: 2},
      feedsById: {1: mockFeed}
    }

    // mount component
    enzyme.mount(<Modification {...props} />)
  })
})
