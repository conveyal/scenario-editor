/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed } from '../../test-utils/mock-data'

import ConvertToFrequency from '../../../lib/components/modification/convert-to-frequency'

describe('Component > Modification > ConvertToFrequency', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      modification: {},
      setActiveTrips: jest.fn(),
      update: jest.fn()
    }
    const tree = mount(
      <ConvertToFrequency
        {...props}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    const noCalls = [
      'setActiveTrips',
      'update'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
