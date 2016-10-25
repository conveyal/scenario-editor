/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed } from '../../test-utils/mock-data'

import Reroute from '../../../lib/components/modification/reroute'

describe('Component > Modification > Reroute', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      mapState: {},
      modification: {
        segments: []
      },
      setMapState: jest.fn(),
      update: jest.fn()
    }
    const tree = mount(
      <Reroute
        {...props}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    const noCalls = [
      'setMapState',
      'update'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
