/* global describe, it, expect, jest */

import React from 'react'
import renderer from 'react-test-renderer'

import { mockComponents } from '../../../testUtils'

jest.mock('../../../lib/components/buttons', () => { return mockComponents(['Button']) })
jest.mock('../../../lib/components/icon', () => 'Icon')
jest.mock('../../../lib/components/input', () => { return mockComponents(['Checkbox', 'Number']) })
jest.mock('../../../lib/components/timetable', () => 'Timetable')

import AddTripPattern from '../../../lib/components/modification/add-trip-pattern'

describe('AddTripPattern', () => {
  it('renders correctly', () => {
    const mapState = {
      allowExtend: true,
      extendFromEnd: true,
      followRoad: true,
      state: 'add-trip-pattern',
      modificationId: '1234'
    }
    const modification = {
      id: '1234',
      segments: [],
      timetables: [
        {
          name: 'Test timetable',
          speed: 40,
          dwellTime: 10,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
          headwaySecs: 900, // 15 minutes
          startTime: 28800, // 8am
          endTime: 57600 // 4pm
        }
      ],
      bidirectional: false
    }
    const replaceModificationFn = jest.fn()
    const setMapStateFn = jest.fn()
    const updateFn = jest.fn()
    const tree = renderer.create(
      <AddTripPattern
        mapState={mapState}
        modification={modification}
        replaceModification={replaceModificationFn}
        setMapState={setMapStateFn}
        update={updateFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(replaceModificationFn).not.toBeCalled
    expect(setMapStateFn).not.toBeCalled
    expect(updateFn).not.toBeCalled
  })
})
