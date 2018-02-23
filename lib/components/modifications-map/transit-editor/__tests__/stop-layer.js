// @flow

import renderer from 'react-test-renderer'
import React from 'react'
import {Map} from 'react-leaflet'

import GTFSStopGridLayer from '../gtfs-stop-gridlayer'
import {mockGtfsStops} from '../../../../utils/mock-data.js'

describe('Component > Transit-Editor > GTFSStopGridLayer', () => {
  it('renders correctly', () => {
    const props = {
      stops: mockGtfsStops
    }

    // mount component
    const tree = renderer
      .create(
        <Map>
          <GTFSStopGridLayer {...props} />
        </Map>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
