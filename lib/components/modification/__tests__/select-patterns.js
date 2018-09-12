// @flow

import renderer from 'react-test-renderer'
import React from 'react'

import SelectPatterns from '../select-patterns'
import {mockPattern} from '../../../utils/mock-data'

describe('Component > SelectPatterns', () => {
  it('renders correctly', () => {
    const onChangeFn = jest.fn()
    const tree = renderer
      .create(
        <SelectPatterns
          onChange={onChangeFn}
          routePatterns={[mockPattern]}
          trips={null}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
