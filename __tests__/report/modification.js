/* global describe, expect, it */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed, mockModification } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import Modification from '../../lib/report/modification'

mockModification.type = 'adjust-dwell-time'

describe('Report > Modification', () => {
  it('renders correctly', () => {
    const props = {
      modification: mockModification,
      feedsById: { '1': mockFeed }
    }

    // mount component
    const tree = mount(
      <Modification
        {...props}
        />
      , {
        attachTo: document.getElementById('test')
      }
    )
    expect(mountToJson(tree.find('ul'))).toMatchSnapshot()

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})
