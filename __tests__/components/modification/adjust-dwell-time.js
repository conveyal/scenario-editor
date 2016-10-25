/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockFeed, mockModification } from '../../test-utils/mock-data'

import AdjustDwellTime from '../../../lib/components/modification/adjust-dwell-time'

describe('Component > Modification > AdjustDwellTime', () => {
  it('renders correctly', () => {
    const props = {
      addControl: jest.fn(),
      addLayer: jest.fn(),
      feeds: [mockFeed],
      feedsById: { '1': mockFeed },
      modification: mockModification,
      removeControl: jest.fn(),
      removeLayer: jest.fn(),
      replaceModification: jest.fn(),
      setMapState: jest.fn()
    }
    const tree = mount(
      <AdjustDwellTime
        {...props}
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    const noCalls = [
      'addControl',
      'addLayer',
      'removeControl',
      'removeLayer',
      'replaceModification',
      'setMapState'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
