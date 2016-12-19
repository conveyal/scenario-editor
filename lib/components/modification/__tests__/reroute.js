/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import { mockFeed } from '../../../utils/mock-data'

import Reroute from '../reroute'

describe('Component > Modification > Reroute', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      lastStopDistanceFromStart: 0,
      mapState: {},
      modification: {
        segments: []
      },
      setMapState: jest.fn(),
      stops: [],
      totalTravelTimeMinutes: 0,
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
