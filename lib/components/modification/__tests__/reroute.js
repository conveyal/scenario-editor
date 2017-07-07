/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import {mockFeed, mockRoute} from '../../../utils/mock-data'

import Reroute from '../reroute'

describe('Component > Modification > Reroute', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      mapState: {},
      modification: {
        dwellTime: 0,
        segments: [],
        segmentSpeeds: [],
        routes: [mockRoute.id]
      },
      routePatterns: [mockRoute],
      segmentDistances: [],
      setMapState: jest.fn(),
      stops: [],
      update: jest.fn()
    }
    const tree = renderer.create(
      <Reroute
        {...props}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    const noCalls = [
      'setMapState',
      'update'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
