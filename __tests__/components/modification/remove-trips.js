/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed } from '../../test-utils/mock-data'

import RemoveTrips from '../../../lib/components/modification/remove-trips'

describe('Component > Modification > RemoveTrips', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      modification: {},
      update: jest.fn()
    }
    const tree = mount(
      <RemoveTrips
        {...props}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    expect(props['update']).not.toBeCalled()
  })
})
