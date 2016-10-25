/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockTimetable } from '../test-utils/mock-data'

import Timetable from '../../lib/components/timetable'

describe('Component > Timetable', () => {
  it('renders correctly', () => {
    const removeTimetableFn = jest.fn()
    const replaceTimetableFn = jest.fn()
    const tree = mount(
      <Timetable
        timetable={mockTimetable}
        removeTimetable={removeTimetableFn}
        replaceTimetable={replaceTimetableFn}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    expect(removeTimetableFn).not.toBeCalled()
    expect(replaceTimetableFn).not.toBeCalled()
  })
})
