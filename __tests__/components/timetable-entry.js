/* global describe, it, expect, jest */

import React from 'react'
import renderer from 'react-test-renderer'

import { mockComponents } from '../../testUtils'

jest.mock('../../lib/components/input', () => { return mockComponents(['Checkbox', 'Number', 'Text']) })

import TimetableEntry from '../../lib/components/timetable-entry'

describe('TimetableEntry', () => {
  it('renders correctly', () => {
    const timetable = {
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
    const replaceTimetableFn = jest.fn()
    const tree = renderer.create(
      <TimetableEntry
        timetable={timetable}
        replaceTimetable={replaceTimetableFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(replaceTimetableFn).not.toBeCalled
  })
})
