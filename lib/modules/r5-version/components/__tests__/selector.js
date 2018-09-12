// @flow
import React from 'react'

import {mockWithProvider} from '../../../../utils/mock-data'
import Selector from '../selector'

describe('R5 Version > Components > Selector', () => {
  it('should render', () => {
    const {snapshot} = mockWithProvider(<Selector />)
    expect(snapshot()).toMatchSnapshot()
  })
})
