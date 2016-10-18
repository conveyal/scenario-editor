/* global describe, it, expect */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed, mockModification, mockSegment } from '../../test-utils/mock-data'
import Leaflet from '../../test-utils/mock-leaflet'

import Reroute from '../../lib/report/reroute'

mockModification.segments.push(mockSegment)

describe('Report > Reroute', () => {
  it('renders correctly', () => {
    const props = {
      feedsById: { '1': mockFeed },
      modification: mockModification
    }

    // mount component
    const tree = mount(
      <Reroute
        {...props}
        />
      , {
        attachTo: document.getElementById('test')
      }
    )
    expect(mountToJson(tree.find('.table'))).toMatchSnapshot()

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})
