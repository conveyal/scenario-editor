/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed, mockMapState, mockModification } from '../../test-utils/mock-data'

import ModificationEditor from '../../../lib/components/modification/editor'

describe('Component > Modification > ModificationEditor', () => {
  it('renders correctly', () => {
    const props = {
      allVariants: [],
      bundleId: '1',
      modification: mockModification,
      name: 'Test Modification',
      remove: jest.fn(),
      replace: jest.fn(),
      type: 'add-trip-pattern',
      variants: [],
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      mapState: mockMapState,
      setActiveTrips: jest.fn(),
      setMapState: jest.fn()
    }
    const tree = mount(
      <ModificationEditor
        {...props}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    const noCalls = [
      'remove',
      'replace',
      'setActiveTrips',
      'setMapState'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
