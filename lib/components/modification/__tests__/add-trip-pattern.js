// @flow

import renderer from 'react-test-renderer'
import React from 'react'

import {mockMapState, mockModification} from '../../../utils/mock-data'
import {AddTripPattern} from '../add-trip-pattern'

describe('Component > Modification > AddTripPattern', () => {
  it('renders correctly', () => {
    const setMapStateFn = jest.fn()
    const updateFn = jest.fn()
    const tree = renderer
      .create(
        <AddTripPattern
          allPhaseFromTimetableStops={{}}
          extendFromEnd
          gtfsStops={[]}
          mapState={mockMapState}
          modification={mockModification}
          numberOfStops={0}
          qualifiedStops={[]}
          projectTimetables={[]}
          segmentDistances={[]}
          setMapState={setMapStateFn}
          update={updateFn}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
    expect(setMapStateFn).not.toBeCalled()
    expect(updateFn).not.toBeCalled()
  })
})
