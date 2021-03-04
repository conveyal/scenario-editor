import enzyme from 'enzyme'
import {latLngBounds} from 'leaflet'
import React from 'react'

import MiniMap from '../mini-map'

describe('Report > MiniMap', () => {
  it('renders correctly', () => {
    const props = {
      bounds: latLngBounds([
        [40.712, -74.227],
        [40.774, -74.125]
      ])
    }

    enzyme.mount(<MiniMap {...props} />)
  })
})
