//
import enzyme from 'enzyme'
import React from 'react'

import Speed from '../speed'

describe('Report > Speed', () => {
  it('renders correctly', () => {
    const props = {
      kmh: 2000
    }

    // mount component
    enzyme.mount(<Speed {...props} />)
  })
})
