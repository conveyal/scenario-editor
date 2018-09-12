// @flow

import renderer from 'react-test-renderer'
import React from 'react'

import {mockModification} from '../../../utils/mock-data'
import EditAlignment from '../edit-alignment'

describe('Component > Modification > Edit Alignment', function () {
  it('renders correctly', function () {
    const props = {
      disabled: false,
      extendFromEnd: false,
      mapState: {
        modificationId: mockModification._id,
        state: null
      },
      modification: mockModification,
      numberOfStops: 16,
      segmentDistances: [45.22],
      setMapState: jest.fn(),
      update: jest.fn()
    }

    const tree = renderer.create(<EditAlignment {...props} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
