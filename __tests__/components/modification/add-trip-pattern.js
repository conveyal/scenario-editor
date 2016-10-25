/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockMapState, mockModification } from '../../test-utils/mock-data'

import AddTripPattern from '../../../lib/components/modification/add-trip-pattern'

describe('Component > Modification > AddTripPattern', () => {
  it('renders correctly', () => {
    const replaceModificationFn = jest.fn()
    const setMapStateFn = jest.fn()
    const updateFn = jest.fn()
    const tree = mount(
      <AddTripPattern
        mapState={mockMapState}
        modification={mockModification}
        replaceModification={replaceModificationFn}
        setMapState={setMapStateFn}
        update={updateFn}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    expect(replaceModificationFn).not.toBeCalled()
    expect(setMapStateFn).not.toBeCalled()
    expect(updateFn).not.toBeCalled()
  })
})
