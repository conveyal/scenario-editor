// @flow

import React from 'react'
import {Map} from 'react-leaflet'
import renderer from 'react-test-renderer'

import DrawPolygon from '../draw-polygon'

describe('Project-Map > DrawPolygon', () => {
  it('works correctly', () => {
    const tree = renderer
      .create(
        <Map>
          <DrawPolygon
            onPolygon={jest.fn()}
          />
        </Map>
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
