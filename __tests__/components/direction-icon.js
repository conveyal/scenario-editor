/* global jest */

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('leaflet', () => { return { DivIcon: () => 'DivIcon', point: 'point' } })
jest.mock('react-leaflet', () => { return mockExports(['Marker']) })

import DirectionIcon from '../../lib/components/direction-icon'

basicRenderTest({
  component: DirectionIcon,
  name: 'DirectionIcon',
  props: {
    bearing: 123,
    clickable: true,
    color: 'blue',
    coordinates: [12, 34],
    iconSize: 20
  }
})
