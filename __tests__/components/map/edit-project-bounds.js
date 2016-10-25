/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import Leaflet from '../../test-utils/mock-leaflet'
import React from 'react'
import { Map } from 'react-leaflet'

import EditProjectBounds from '../../../lib/components/map/edit-project-bounds'

describe('Components > Map > EditProjectBounds', () => {
  it('renders correctly', () => {
    const props = {
      bounds: {
        north: 12,
        east: -34,
        south: -34,
        west: 12
      },
      isLoaded: true,
      saveLocally: jest.fn()
    }

    const tree = mount(
      <Map>
        <EditProjectBounds
          {...props}
          />
      </Map>
    , {
      attachTo: document.getElementById('test')
    })

    // expect map markers representing bounds to be added to map
    // by intercepting call to Leaflet
    expect(Leaflet.marker.mock.calls[0][0]).toMatchSnapshot()
    expect(Leaflet.marker.mock.calls[1][0]).toMatchSnapshot()

    // expect rectangle representing bounds to be added to map
    // by intercepting call to Leaflet
    expect(Leaflet.rectangle.mock.calls[0][0]).toMatchSnapshot()

    // expect map bounds to match snapshot
    const mountedMap = tree.find(Map)
    expect(mountedMap.node.leafletElement.getBounds()).toMatchSnapshot()
  })
})
