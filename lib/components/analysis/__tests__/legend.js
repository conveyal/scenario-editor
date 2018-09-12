// @flow

import React from 'react'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

import Legend from '../legend'

describe('Components > Analysis > Regional > Legend', () => {
  it('should display', () => {
    const tree = mount(
      <Legend
        breaks={[1000, 2000, 3000, 4000]}
        min={0}
        colors={['#111111', '#222222', '#333333', '#444444']}
      />
    )

    expect(mountToJson(tree)).toMatchSnapshot()
  })
})
