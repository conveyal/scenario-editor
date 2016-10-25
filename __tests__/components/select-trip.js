/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed } from '../test-utils/mock-data'

import SelectTrip from '../../lib/components/select-trip'

describe('Component > SelectTrip', () => {
  it('renders correctly', () => {
    const patternTrips = ['abcd']
    const onChangeFn = jest.fn()
    const routes = ['route1']
    const trip = 'abcd'
    const tree = mount(
      <SelectTrip
        feed={mockFeed}
        onChange={onChangeFn}
        patternTrips={patternTrips}
        routes={routes}
        trip={trip}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
