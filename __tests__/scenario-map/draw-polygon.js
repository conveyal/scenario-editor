/* global describe, it, jest */

import { drawMock } from '../test-utils/mock-leaflet'

import DrawPolygon from '../../lib/scenario-map/draw-polygon'

drawMock()

describe('Scenario-Map > DrawPolygon', () => {
  it('works correctly', () => {
    // initialize
    const mockCallback = jest.fn()
    const drawer = new DrawPolygon(mockCallback)

    // add to map
    const mockMap = { on: jest.fn() }
    drawer.onAdd(mockMap)
    drawer.onRemove(mockMap)
  })
})
