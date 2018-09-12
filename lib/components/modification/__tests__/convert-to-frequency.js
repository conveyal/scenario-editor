// @flow
import renderer from 'react-test-renderer'
import React from 'react'

import {mockFeed, mockModification, mockPattern, mockStop1} from '../../../utils/mock-data'
import ConvertToFrequency from '../convert-to-frequency'

describe('Component > Modification > ConvertToFrequency', () => {
  it('renders correctly', () => {
    const props = {
      allPhaseFromTimetableStops: {},
      feeds: [mockFeed],
      feedScopedModificationStops: [mockStop1],
      modification: mockModification,
      projectTimetables: [],
      routePatterns: [mockPattern],
      selectedFeed: mockFeed,

      // actions
      setActiveTrips: jest.fn(),
      update: jest.fn(),
      updateAndRetrieveFeedData: jest.fn()
    }
    const tree = renderer.create(
      <ConvertToFrequency {...props} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    const noCalls = ['setActiveTrips', 'update']
    noCalls.forEach(fn => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
