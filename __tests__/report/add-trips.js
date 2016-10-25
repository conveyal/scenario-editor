/* global describe, it, expect */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockModification, mockSegment } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import AddTrips from '../../lib/report/add-trips'

mockModification.segments.push(mockSegment)

describe('Report > AddTrips', () => {
  it('renders correctly', () => {
    const props = {
      modification: mockModification
    }

    // mount component
    const tree = mount(
      <AddTrips
        {...props}
        />
      , {
        attachTo: document.getElementById('test')
      }
    )
    expect(mountToJson(tree.find('.table'))).toMatchSnapshot()

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()

    // expect circleMarker to be added to map by intercepting call to Leaflet
    expect(Leaflet.circleMarker.mock.calls[0][0]).toMatchSnapshot()
  })
})
