/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed, mockTimetable } from '../test-utils/mock-data'

import FrequencyEntry from '../../lib/components/frequency-entry'

describe('Component > FrequencyEntry', () => {
  it('renders correctly', () => {
    const replaceTimetableFn = jest.fn()
    const removeTimetableFn = jest.fn()
    const setActiveTripsFn = jest.fn()
    const tree = mount(
      <FrequencyEntry
        feed={mockFeed}
        replaceTimetable={replaceTimetableFn}
        removeTimetable={removeTimetableFn}
        setActiveTrips={setActiveTripsFn}
        timetable={mockTimetable}
        routes={['route1']}
        trip='abcd'
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    expect(replaceTimetableFn).not.toBeCalled()
    expect(removeTimetableFn).not.toBeCalled()
    expect(setActiveTripsFn).not.toBeCalled()
  })
})
