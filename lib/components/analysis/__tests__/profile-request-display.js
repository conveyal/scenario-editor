// @flow

import React from 'react'
import renderer from 'react-test-renderer'

import {mockProfileRequest} from '../../../utils/mock-data'
import ProfileRequestDisplay from '../profile-request-display'

describe('Components > Analysis > Profile Request Display', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(<ProfileRequestDisplay {...mockProfileRequest} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
