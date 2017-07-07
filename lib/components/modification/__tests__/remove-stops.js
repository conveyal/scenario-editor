/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import {
  mockFeed,
  mockPattern,
  mockRoute
} from '../../../utils/mock-data'

import RemoveStops from '../remove-stops'

describe('Component > Modification > RemoveStops', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      modification: {
        routes: [mockRoute.id]
      },
      routePatterns: [mockPattern],
      routeStops: [],
      selectedStops: [],
      setMapState: jest.fn(),
      update: jest.fn()
    }
    const tree = renderer.create(
      <RemoveStops
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
