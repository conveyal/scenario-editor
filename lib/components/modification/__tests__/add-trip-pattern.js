/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import { mockMapState, mockModification } from '../../../utils/mock-data'

import AddTripPattern from '../add-trip-pattern'

describe('Component > Modification > AddTripPattern', () => {
  it('renders correctly', () => {
    const replaceModificationFn = jest.fn()
    const setMapStateFn = jest.fn()
    const updateFn = jest.fn()
    const tree = renderer.create(
      <AddTripPattern
        lastStopDistanceFromStart={0}
        mapState={mockMapState}
        modification={mockModification}
        replaceModification={replaceModificationFn}
        setMapState={setMapStateFn}
        stops={[]}
        update={updateFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(replaceModificationFn).not.toBeCalled()
    expect(setMapStateFn).not.toBeCalled()
    expect(updateFn).not.toBeCalled()
  })
})
