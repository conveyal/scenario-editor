// @flow
import React from 'react'

import EditRegion from '../edit-region'
import {mockRegion, mockWithProvider} from '../../utils/mock-data'

describe('Component > EditRegion', () => {
  it('renders correctly', () => {
    const props = {
      region: mockRegion,
      clearUncreatedRegion: jest.fn(),
      fetch: jest.fn(),
      save: jest.fn(),
      load: jest.fn(),
      create: jest.fn(),
      deleteRegion: jest.fn(),
      setLocally: jest.fn(),
      setCenter: jest.fn(),
      isEditing: true
    }

    // mount component
    const {snapshot} = mockWithProvider(<EditRegion {...props} />)
    expect(snapshot()).toMatchSnapshot()
    const noCalls = [
      'clearUncreatedRegion',
      'save',
      'load',
      'setLocally',
      'setCenter'
    ]
    noCalls.forEach(fn => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
