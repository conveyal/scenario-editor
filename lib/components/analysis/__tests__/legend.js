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
        colors={Array(4)
          .fill(0)
          .map((_, i) => ({r: 0, g: 0, b: 0, opacity: i}))}
      />
    )

    expect(mountToJson(tree)).toMatchSnapshot()
  })
})
