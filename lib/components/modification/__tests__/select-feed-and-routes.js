/* global describe, it, expect, jest */

describe('Component > SelectFeedAndRoutes', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const SelectFeedAndRoutes = require('../select-feed-and-routes')

  it('renders correctly', () => {
    const feeds = [{ id: 1 }, { id: 2 }]
    const onChangeFn = jest.fn()
    const tree = renderer.create(
      <SelectFeedAndRoutes
        feeds={feeds}
        onChange={onChangeFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
