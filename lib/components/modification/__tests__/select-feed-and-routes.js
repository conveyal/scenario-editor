// @flow

import renderer from 'react-test-renderer'
import React from 'react'

import SelectFeedAndRoutes from '../select-feed-and-routes'
import {mockFeed} from '../../../utils/mock-data'

describe('Component > SelectFeedAndRoutes', () => {
  it('renders correctly', () => {
    const onChangeFn = jest.fn()
    const tree = renderer
      .create(
        <SelectFeedAndRoutes
          feeds={[mockFeed]}
          onChange={onChangeFn}
          selectedFeed={null}
          selectedRouteIds={[]}
        />
      )
      .toJSON()
    expect(tree).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
