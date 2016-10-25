/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed } from '../../test-utils/mock-data'

import AdjustSpeed from '../../../lib/components/modification/adjust-speed'

describe('Component > Modification > AdjustSpeed', () => {
  it('renders correctly', () => {
    const props = {
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      modification: {},
      replaceModification: jest.fn(),
      setMapState: jest.fn()
    }
    const tree = mount(
      <AdjustSpeed
        {...props}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    const noCalls = [
      'replaceModification',
      'setMapState'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
